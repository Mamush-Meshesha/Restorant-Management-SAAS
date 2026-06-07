import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const create_dining_area = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { branch_id, name, description } = req.body;

    const area = await prisma.diningArea.create({
      data: { branch_id, name, description }
    });

    res.status(201).json({ message: "Dining Area created", data: area });
  } catch (error) { next(error); }
};

export const get_dining_areas = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { branchId } = req.query;
    
    if (!branchId) return res.status(400).json({ message: "Branch ID required" });

    const areas = await prisma.diningArea.findMany({
      where: { branch_id: String(branchId), is_active: true },
      include: { tables: true }
    });

    res.status(200).json({ data: areas });
  } catch (error) { next(error); }
};

export const create_table = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { branch_id, dining_area_id, name, capacity, x_pos, y_pos } = req.body;

    const table = await prisma.table.create({
      data: {
        branch_id,
        dining_area_id,
        name,
        capacity: capacity || 2,
        x_pos,
        y_pos
      }
    });

    res.status(201).json({ message: "Table created", data: table });
  } catch (error) { next(error); }
};
