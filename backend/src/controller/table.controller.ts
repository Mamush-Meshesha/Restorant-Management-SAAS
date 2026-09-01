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
    
    if (branchId) {
      whereClause.branch_id = String(branchId);
    } else if (req.user?.branch_id) {
      whereClause.branch_id = req.user.branch_id;
    }

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
    const { branch_id, dining_area_id, name, capacity, x_pos, y_pos, rotation, scale_x, scale_y } = req.body;

    const table = await prisma.table.create({
      data: {
        branch_id,
        dining_area_id,
        name,
        capacity: capacity || 2,
        x_pos,
        y_pos,
        rotation,
        scale_x,
        scale_y
      }
    });

    res.status(201).json({ message: "Table created", data: table });
  } catch (error) { next(error); }
};

export const get_tables = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { branchId, status, areaId } = req.query;

    const whereClause: any = {};
    
    if (branchId) {
      whereClause.branch_id = String(branchId);
    } else if (req.user?.branch_id) {
      whereClause.branch_id = req.user.branch_id;
    }
    
    if (status) whereClause.status = String(status);
    if (areaId) whereClause.dining_area_id = String(areaId);

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

export const batch_update_tables = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { tables } = req.body;
    if (!Array.isArray(tables)) {
      return res.status(400).json({ error: "tables array is required" });
    }

    // Use a transaction to update all tables efficiently
    await prisma.$transaction(
      tables.map((t: any) =>
        prisma.table.update({
          where: { id: t.id },
          data: {
            x_pos: typeof t.x_pos === 'number' ? t.x_pos : undefined,
            y_pos: typeof t.y_pos === 'number' ? t.y_pos : undefined,
            rotation: typeof t.rotation === 'number' ? t.rotation : undefined,
            scale_x: typeof t.scale_x === 'number' ? t.scale_x : undefined,
            scale_y: typeof t.scale_y === 'number' ? t.scale_y : undefined,
            name: t.name !== undefined ? t.name : undefined,
            capacity: t.capacity !== undefined ? t.capacity : undefined
          }
        })
      )
    );

    res.status(200).json({ message: "Tables updated successfully" });
  } catch (error) { next(error); }
};
