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
    
    const whereClause: any = { is_active: true };
    if (branchId) whereClause.branch_id = String(branchId);

    const areas = await prisma.diningArea.findMany({
      where: whereClause,
      include: { tables: true }
    });

    res.status(200).json({ data: areas });
  } catch (error) { next(error); }
};

export const update_dining_area = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    const area = await prisma.diningArea.update({
      where: { id },
      data: { name, description, is_active }
    });
    res.status(200).json({ message: "Dining Area updated", data: area });
  } catch (error) { next(error); }
};

export const delete_dining_area = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.diningArea.delete({ where: { id } });
    res.status(200).json({ message: "Dining Area deleted" });
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

export const get_tables = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { branchId, status } = req.query;

    const whereClause: any = {};
    if (branchId) whereClause.branch_id = String(branchId);
    if (status) whereClause.status = String(status);

    const tables = await prisma.table.findMany({
      where: whereClause,
      include: { diningArea: true }
    });

    // Map name to table_number for frontend compatibility
    const mappedTables = tables.map(t => ({
      ...t,
      table_number: t.name,
      capacity: t.capacity
    }));

    res.status(200).json({ data: mappedTables });
  } catch (error) { next(error); }
};

export const update_table = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, capacity } = req.body;
    const table = await prisma.table.update({
      where: { id },
      data: { name, capacity }
    });
    res.status(200).json({ message: "Table updated", data: table });
  } catch (error) { next(error); }
};

export const delete_table = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.table.delete({ where: { id } });
    res.status(200).json({ message: "Table deleted" });
  } catch (error) { next(error); }
};

export const update_table_status = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const table = await prisma.table.update({
      where: { id },
      data: { status }
    });
    res.status(200).json({ message: "Status updated", data: table });
  } catch (error) { next(error); }
};
