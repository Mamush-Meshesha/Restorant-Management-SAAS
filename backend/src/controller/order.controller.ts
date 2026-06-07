import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const create_order = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let branchId = req.user?.branch_id || req.body.branch_id;
    if (!branchId) {
      const firstBranch = await prisma.branch.findFirst();
      if (!firstBranch) return res.status(400).json({ message: "No branch found to assign order" });
      branchId = firstBranch.id;
    }
    const { table_id, order_type, items } = req.body; // items: [{ menu_item_id, quantity, notes }]
    
    // Calculate totals
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menu_item_id } });
      if (!menuItem) continue;

      const itemTotal = menuItem.base_price * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: menuItem.base_price,
        total_price: itemTotal,
        notes: item.notes
      });
    }

    const order = await prisma.order.create({
      data: {
        branch_id: branchId,
        table_id,
        order_type: order_type || 'DINE_IN',
        waiter_id: req.user?.id,
        subtotal,
        total_amount: subtotal, // Without tax for now
        items: {
          create: orderItemsData
        }
      },
      include: { items: true }
    });

    // --- Generate Kitchen Orders ---
    // Find a kitchen station for this branch (fallback to any station if none specific)
    let station = await prisma.kitchenStation.findFirst({ where: { branch_id: branchId } });
    if (!station) {
      // Create a default station if none exists for this branch
      station = await prisma.kitchenStation.create({
        data: { branch_id: branchId, name: "Main Kitchen" }
      });
    }

    if (station && order.items) {
      const kitchenOrdersData = order.items.map(item => ({
        station_id: station!.id,
        order_item_id: item.id,
        status: 'PENDING'
      }));
      await prisma.kitchenOrder.createMany({ data: kitchenOrdersData });
    }

    res.status(201).json({ message: "Order created successfully", data: order });
  } catch (error) { next(error); }
};

export const get_orders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.query.branchId as string;
    const status = req.query.status as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const whereClause: any = {};
    if (branchId) whereClause.branch_id = branchId;      // Superadmins have no branch_id → see all
    if (status) whereClause.status = status;

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        table: true,
        items: {
          include: { menuItem: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    res.status(200).json({ data: orders });
  } catch (error) { next(error); }
};

export const update_order_status = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });
    res.status(200).json({ message: 'Order status updated', data: order });
  } catch (error) { next(error); }
};

export const cancel_order = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
    res.status(200).json({ message: 'Order cancelled', data: order });
  } catch (error) { next(error); }
};
