import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const get_kitchen_orders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { branchId, stationId } = req.query;
    
    const whereClause: any = { status: { in: ['PENDING', 'PREPARING'] } };
    if (stationId) whereClause.station_id = String(stationId);
    
    // In a real app we'd filter by branchId too via joins
    const orders = await prisma.kitchenOrder.findMany({
      where: whereClause,
      include: {
        orderItem: {
          include: { 
            menuItem: true,
            order: { include: { table: true } }
          }
        },
        station: true
      },
      orderBy: { orderItem: { created_at: 'asc' } }
    });

    res.status(200).json({ data: orders });
  } catch (error) { next(error); }
};

export const update_kitchen_order_status = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PREPARING, READY

    const updateData: any = { status };
    if (status === 'PREPARING') updateData.started_at = new Date();
    if (status === 'READY') updateData.completed_at = new Date();

    const order = await prisma.kitchenOrder.update({
      where: { id },
      data: updateData
    });

    // Automatically update the main OrderItem status too
    await prisma.orderItem.update({
      where: { id: order.order_item_id },
      data: { status }
    });

    res.status(200).json({ message: "Status updated", data: order });
  } catch (error) { next(error); }
};
