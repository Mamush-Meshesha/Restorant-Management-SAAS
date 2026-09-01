import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

// ─── EMPLOYEES ─────────────────────────────────────────────────────────────

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
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ data: employees });
  } catch (error) { next(error); }
};

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
      },
      include: { department: true, position: true, employmentType: true }
    });

    res.status(201).json({ message: "Employee created", data: employee });
  } catch (error) { next(error); }
};

export const update_employee = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { department_id, position_id, employment_type_id, first_name, last_name, phone, email, is_active } = req.body;
    
    const employee = await prisma.employee.update({
      where: { id },
      data: { department_id, position_id, employment_type_id, first_name, last_name, phone, email, is_active },
      include: { department: true, position: true, employmentType: true }
    });
    res.status(200).json({ message: "Employee updated", data: employee });
  } catch (error) { next(error); }
};

export const delete_employee = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.employee.update({
      where: { id },
      data: { is_active: false }
    });
    res.status(200).json({ message: "Employee deactivated" });
  } catch (error) { next(error); }
};

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────

export const get_departments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const items = await prisma.department.findMany({ where: { organization_id: orgId, is_active: true } });
    res.status(200).json({ data: items });
  } catch (error) { next(error); }
};

export const create_department = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const { name } = req.body;
    const item = await prisma.department.create({ data: { organization_id: orgId!, name } });
    res.status(201).json({ message: "Department created", data: item });
  } catch (error) { next(error); }
};

export const update_department = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;
    const item = await prisma.department.update({ where: { id }, data: { name, is_active } });
    res.status(200).json({ message: "Department updated", data: item });
  } catch (error) { next(error); }
};

export const delete_department = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.department.update({ where: { id }, data: { is_active: false } });
    res.status(200).json({ message: "Department deleted" });
  } catch (error) { next(error); }
};

// ─── POSITIONS ───────────────────────────────────────────────────────────

export const get_positions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const items = await prisma.position.findMany({ where: { organization_id: orgId, is_active: true } });
    res.status(200).json({ data: items });
  } catch (error) { next(error); }
};

export const create_position = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const { name, base_salary } = req.body;
    const item = await prisma.position.create({ data: { organization_id: orgId!, name, base_salary: Number(base_salary) } });
    res.status(201).json({ message: "Position created", data: item });
  } catch (error) { next(error); }
};

export const update_position = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, base_salary, is_active } = req.body;
    const item = await prisma.position.update({ where: { id }, data: { name, base_salary: Number(base_salary), is_active } });
    res.status(200).json({ message: "Position updated", data: item });
  } catch (error) { next(error); }
};

export const delete_position = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.position.update({ where: { id }, data: { is_active: false } });
    res.status(200).json({ message: "Position deleted" });
  } catch (error) { next(error); }
};

// ─── EMPLOYMENT TYPES ────────────────────────────────────────────────────

export const get_employment_types = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const items = await prisma.employmentType.findMany({ where: { organization_id: orgId } });
    res.status(200).json({ data: items });
  } catch (error) { next(error); }
};

export const create_employment_type = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const { name } = req.body;
    const item = await prisma.employmentType.create({ data: { organization_id: orgId!, name } });
    res.status(201).json({ message: "Employment Type created", data: item });
  } catch (error) { next(error); }
};

export const update_employment_type = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const item = await prisma.employmentType.update({ where: { id }, data: { name } });
    res.status(200).json({ message: "Employment Type updated", data: item });
  } catch (error) { next(error); }
};

export const delete_employment_type = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.employmentType.delete({ where: { id } });
    res.status(200).json({ message: "Employment Type deleted" });
  } catch (error) { next(error); }
};
