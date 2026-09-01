import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const get_live_dashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || (req.query.branchId as string);

    if (!branchId) {
      return res.status(400).json({ error: "Branch ID is required" });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Revenue Today (orders closed today)
    const revenueStats = await prisma.order.aggregate({
      where: {
        branch_id: branchId,
        status: 'CLOSED',
        created_at: { gte: todayStart, lte: todayEnd }
      },
      _sum: { total_amount: true }
    });
    const todayRevenue = revenueStats._sum.total_amount || 0;

    // 2. Active Orders
    const activeOrdersCount = await prisma.order.count({
      where: {
        branch_id: branchId,
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] }
      }
    });

    // 3. Tables Occupied
    const tablesStats = await prisma.table.groupBy({
      by: ['status'],
      where: { branch_id: branchId },
      _count: { _all: true }
    });
    let totalTables = 0;
    let occupiedTables = 0;
    tablesStats.forEach(stat => {
      totalTables += stat._count._all;
      if (stat.status === 'OCCUPIED') {
        occupiedTables += stat._count._all;
      }
    });

    // 4. Kitchen Queue
    const kitchenOrders = await prisma.kitchenOrder.groupBy({
      by: ['status'],
      where: {
        orderItem: {
          order: { branch_id: branchId }
        },
        status: { in: ['PENDING', 'PREPARING'] }
      },
      _count: { _all: true }
    });
    let pendingKitchen = 0;
    let preparingKitchen = 0;
    kitchenOrders.forEach(stat => {
      if (stat.status === 'PENDING') pendingKitchen += stat._count._all;
      if (stat.status === 'PREPARING') preparingKitchen += stat._count._all;
    });

    // 5. Recent Orders (top 6 active or recent)
    const recentOrdersRaw = await prisma.order.findMany({
      where: { branch_id: branchId },
      orderBy: { created_at: 'desc' },
      take: 6,
      select: {
        id: true,
        total_amount: true,
        status: true,
        created_at: true,
        table: { select: { name: true } },
        items: { select: { quantity: true } }
      }
    });
    
    // Format recent orders for frontend
    const recentOrders = recentOrdersRaw.map(o => ({
      id: o.id.substring(0, 8).toUpperCase(),
      table: o.table?.name ? `T-${o.table.name}` : "Takeaway",
      items: o.items.reduce((sum, item) => sum + item.quantity, 0),
      total: `$${Number(o.total_amount).toFixed(2)}`,
      status: o.status,
      elapsed: Math.floor((Date.now() - new Date(o.created_at).getTime()) / 60000) + "m"
    }));

    // 6. Top Selling Items (Today)
    // Find all items sold today
    const topItemsRaw = await prisma.orderItem.groupBy({
      by: ['menu_item_id'],
      where: {
        order: {
          branch_id: branchId,
          created_at: { gte: todayStart, lte: todayEnd },
          status: 'CLOSED'
        }
      },
      _sum: {
        quantity: true,
        total_price: true
      },
      orderBy: {
        _sum: { quantity: 'desc' }
      },
      take: 4
    });

    // Fetch names for top items
    const menuItemIds = topItemsRaw.map(item => item.menu_item_id);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      select: { id: true, name: true }
    });
    const itemMap = new Map(menuItems.map(item => [item.id, item.name]));

    const topItems = topItemsRaw.map(item => ({
      name: itemMap.get(item.menu_item_id) || item.menu_item_id,
      orders: item._sum.quantity || 0,
      revenue: `$${Number(item._sum.total_price || 0).toFixed(2)}`
    }));

    res.status(200).json({
      data: {
        todayRevenue,
        activeOrdersCount,
        tables: { total: totalTables, occupied: occupiedTables },
        kitchen: { pending: pendingKitchen, preparing: preparingKitchen },
        recentOrders,
        topItems
      }
    });
  } catch (error) {
    next(error);
  }
};
