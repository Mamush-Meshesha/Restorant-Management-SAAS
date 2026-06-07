import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const get_inventory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.query.branchId as string;
    
    const items = await prisma.inventoryItem.findMany({
      where: { branch_id: branchId, is_active: true },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({ data: items });
  } catch (error) { next(error); }
};

export const add_inventory_item = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.body.branch_id;
    const { name, sku, category, unit, minimum_stock, cost_per_unit } = req.body;

    const item = await prisma.inventoryItem.create({
      data: {
        branch_id: branchId,
        name,
        sku,
        category,
        unit,
        minimum_stock,
        cost_per_unit
      }
    });

    res.status(201).json({ message: "Inventory item created", data: item });
  } catch (error) { next(error); }
};

export const adjust_stock = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { item_id, quantity_changed, reason } = req.body;

    const adjustment = await prisma.stockAdjustment.create({
      data: {
        item_id,
        quantity_changed,
        reason
      }
    });

    // Update actual stock
    const item = await prisma.inventoryItem.update({
      where: { id: item_id },
      data: { current_stock: { increment: quantity_changed } }
    });

    res.status(200).json({ message: "Stock adjusted", data: { adjustment, item } });
  } catch (error) { next(error); }
};

export const log_waste = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.body.branch_id;
    const { item_name, quantity, cost_loss, reason } = req.body;

    const waste = await prisma.wasteLog.create({
      data: {
        branch_id: branchId,
        item_name,
        quantity,
        cost_loss,
        reason
      }
    });

    res.status(201).json({ message: "Waste logged", data: waste });
  } catch (error) { next(error); }
};
