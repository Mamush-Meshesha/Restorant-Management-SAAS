import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const create_employee = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const { department_id, position_id, employment_type_id, first_name, last_name, phone, email, hire_date } = req.body;

    const employee = await prisma.employee.create({
      data: {
        organization_id: orgId!,
        department_id,
        position_id,
        employment_type_id,
        first_name,
        last_name,
        phone,
        email,
        hire_date: new Date(hire_date)
      }
    });

    res.status(201).json({ message: "Employee created", data: employee });
  } catch (error) { next(error); }
};

export const get_employees = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const isSuperAdmin = req.user?.role_name === 'SUPERADMIN';
    
    const whereClause: any = {};
    if (!isSuperAdmin) {
      whereClause.organization_id = orgId;
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        department: true,
        position: true,
        employmentType: true
      }
    });

    res.status(200).json({ data: employees });
  } catch (error) { next(error); }
};
