import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const clock_in = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.body.branch_id;
    const { employee_id } = req.body;

    const attendance = await prisma.staffAttendance.create({
      data: {
        employee_id,
        branch_id: branchId,
        date: new Date(),
        clock_in: new Date(),
        status: 'PRESENT'
      }
    });

    res.status(201).json({ message: "Clocked in successfully", data: attendance });
  } catch (error) { next(error); }
};

export const clock_out = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { attendance_id } = req.body;

    const attendance = await prisma.staffAttendance.update({
      where: { id: attendance_id },
      data: { clock_out: new Date() }
    });

    res.status(200).json({ message: "Clocked out successfully", data: attendance });
  } catch (error) { next(error); }
};
