import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const create_order = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.body.branch_id;
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

    res.status(201).json({ message: "Order created successfully", data: order });
  } catch (error) { next(error); }
};

export const get_orders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.query.branchId as string;
    const status = req.query.status as string;
    
    const orders = await prisma.order.findMany({
      where: {
        branch_id: branchId,
        ...(status && { status })
      },
      include: {
        table: true,
        items: {
          include: { menuItem: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ data: orders });
  } catch (error) { next(error); }
};
