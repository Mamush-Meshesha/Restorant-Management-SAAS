import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';
import { createAuditLog } from '../lib/auditTrail';

export const create_role = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const { name, description, permissions } = req.body;

    const role = await prisma.role.create({
      data: {
        organization_id: orgId!,
        name,
        description,
        permissions: {
          create: permissions // Array of permission objects {feature_key, can_read, etc.}
        }
      },
      include: { permissions: true }
    });

    await createAuditLog({
      entity_type: 'ROLE',
      entity_id: role.id,
      action: 'CREATE',
      user_id: req.user?.id,
      organization_id: orgId!,
      ip_address: req.ip,
      details: { name: role.name }
    });

    res.status(201).json({ message: "Role created", data: role });
  } catch (error) { next(error); }
};

export const get_roles = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const roleName = req.user?.role_name;
    const isSuperAdmin = roleName === 'SUPERADMIN';
    
    const whereClause: any = { organization_id: orgId };

    // Role-based exclusions
    const exclusions = [];
    if (roleName === 'COMPANY_ADMIN') {
      exclusions.push('SUPERADMIN', 'COMPANY_ADMIN');
    } else if (roleName === 'BRANCH_MANAGER') {
      exclusions.push('SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER');
    } else if (!isSuperAdmin) {
      exclusions.push('SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER');
    }

    if (exclusions.length > 0) {
      whereClause.name = { notIn: exclusions };
    }

    const roles = await prisma.role.findMany({
      where: whereClause,
      include: { permissions: true }
    });

    res.status(200).json({ data: roles });
  } catch (error) { next(error); }
};

export const update_role = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    // Check if role exists and belongs to the same organization
    const existingRole = await prisma.role.findFirst({
      where: { id, organization_id: orgId }
    });

    if (!existingRole) {
      return res.status(404).json({ message: "Role not found or you don't have access" });
    }

    if (['SUPERADMIN', 'COMPANY_ADMIN'].includes(existingRole.name) && req.user?.role_name !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Forbidden: Cannot modify this role level" });
    }

    // Since permissions are complex to update (diffing), we can delete existing ones and recreate them
    await prisma.permission.deleteMany({ where: { role_id: id } });

    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions: {
          create: permissions
        }
      },
      include: { permissions: true }
    });

    await createAuditLog({
      entity_type: 'ROLE',
      entity_id: role.id,
      action: 'UPDATE',
      user_id: req.user?.id,
      organization_id: orgId!,
      ip_address: req.ip,
      details: { name: role.name }
    });

    res.status(200).json({ message: "Role updated", data: role });
  } catch (error) { next(error); }
};

export const delete_role = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const { id } = req.params;

    const existingRole = await prisma.role.findFirst({
      where: { id, organization_id: orgId }
    });

    if (!existingRole) {
      return res.status(404).json({ message: "Role not found or you don't have access" });
    }

    if (['SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'].includes(existingRole.name)) {
      return res.status(403).json({ message: "Forbidden: Cannot delete core system roles" });
    }

    await prisma.role.delete({ where: { id } });

    await createAuditLog({
      entity_type: 'ROLE',
      entity_id: id,
      action: 'DELETE',
      user_id: req.user?.id,
      organization_id: orgId!,
      ip_address: req.ip,
      details: { name: existingRole.name }
    });

    res.status(200).json({ message: "Role deleted" });
  } catch (error) { next(error); }
};
