import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';
import { hashPassword } from '../lib/password';

export const create_user = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const roleName = req.user?.role_name;
    const isManager = roleName === 'BRANCH_MANAGER';
    
    // Managers can only create users in their own branch
    const branch_id = isManager ? req.user?.branch_id : req.body.branch_id;
    const { role_id, username, email, password, first_name, last_name } = req.body;

    // Security check: Hierarchy enforcement
    if (role_id) {
      const assignedRole = await prisma.role.findUnique({ where: { id: role_id } });
      if (!assignedRole) return res.status(404).json({ message: "Role not found" });

      if (roleName === 'COMPANY_ADMIN' && ['SUPERADMIN', 'COMPANY_ADMIN'].includes(assignedRole.name)) {
        return res.status(403).json({ message: `Forbidden: Cannot create user with ${assignedRole.name} role` });
      }
      
      if (roleName === 'BRANCH_MANAGER' && ['SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'].includes(assignedRole.name)) {
        return res.status(403).json({ message: `Forbidden: Cannot create user with ${assignedRole.name} role` });
      }
      
      if (assignedRole.name === 'SUPERADMIN' && roleName !== 'SUPERADMIN') {
        return res.status(403).json({ message: "Forbidden: Cannot assign SUPERADMIN role" });
      }
    }

    const password_hash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        organization_id: orgId!,
        branch_id,
        role_id,
        username,
        email,
        password_hash,
        first_name,
        last_name
      }
    });

    res.status(201).json({ message: "User created", data: { id: user.id, username: user.username } });
  } catch (error) { next(error); }
};

export const get_users = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const roleName = req.user?.role_name;
    const isSuperAdmin = roleName === 'SUPERADMIN';
    const isManager = roleName === 'BRANCH_MANAGER';
    
    const whereClause: any = {};
    
    if (!isSuperAdmin) {
      whereClause.organization_id = orgId;
    }
    
    if (isManager && req.user?.branch_id) {
      whereClause.branch_id = req.user.branch_id;
    }

    // Role exclusions for visibility
    const roleExclusions = ['Customer'];
    if (roleName === 'COMPANY_ADMIN') {
      roleExclusions.push('SUPERADMIN', 'COMPANY_ADMIN');
    } else if (roleName === 'BRANCH_MANAGER') {
      roleExclusions.push('SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER');
    } else if (!isSuperAdmin) {
      roleExclusions.push('SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER');
    }

    if (isSuperAdmin) {
      whereClause.role = { name: { not: 'Customer' } };
    } else {
      whereClause.OR = [
        { id: req.user?.id },
        { role: { name: { notIn: roleExclusions } } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        role: true,
        branch: true
      }
    });

    const sanitizedUsers = users.map(({ password_hash, ...rest }) => rest);

    res.status(200).json({ data: sanitizedUsers });
  } catch (error) { next(error); }
};

export const update_user = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const roleName = req.user?.role_name;
    const { id } = req.params;
    const { role_id, branch_id, first_name, last_name, is_active } = req.body;

    // Build query based on privileges
    const whereClause: any = { id };
    if (roleName !== 'SUPERADMIN') {
      whereClause.organization_id = orgId;
    }
    if (roleName === 'BRANCH_MANAGER' && req.user?.branch_id) {
      whereClause.branch_id = req.user.branch_id;
    }

    const existingUser = await prisma.user.findFirst({
      where: whereClause,
      include: { role: true }
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found or you do not have permission to edit them" });
    }

    // Prevent editing users equal to or above your role (unless it's yourself)
    if (id !== req.user?.id) {
      if (roleName === 'COMPANY_ADMIN' && ['SUPERADMIN', 'COMPANY_ADMIN'].includes(existingUser.role.name)) {
        return res.status(403).json({ message: "Forbidden: Cannot edit users of this role level" });
      }
      if (roleName === 'BRANCH_MANAGER' && ['SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'].includes(existingUser.role.name)) {
        return res.status(403).json({ message: "Forbidden: Cannot edit users of this role level" });
      }
    }

    // Security check for assigning roles
    if (role_id) {
      const assignedRole = await prisma.role.findUnique({ where: { id: role_id } });
      if (!assignedRole) return res.status(404).json({ message: "Role not found" });

      if (roleName === 'COMPANY_ADMIN' && ['SUPERADMIN', 'COMPANY_ADMIN'].includes(assignedRole.name)) {
        return res.status(403).json({ message: `Forbidden: Cannot assign ${assignedRole.name} role` });
      }
      if (roleName === 'BRANCH_MANAGER' && ['SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'].includes(assignedRole.name)) {
        return res.status(403).json({ message: `Forbidden: Cannot assign ${assignedRole.name} role` });
      }
      if (assignedRole.name === 'SUPERADMIN' && roleName !== 'SUPERADMIN') {
        return res.status(403).json({ message: "Forbidden: Cannot assign SUPERADMIN role" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role_id,
        branch_id: roleName === 'BRANCH_MANAGER' ? undefined : branch_id, // Branch Managers can't change branches
        first_name,
        last_name,
        is_active
      }
    });

    const { password_hash, ...sanitizedUser } = updatedUser;
    res.status(200).json({ message: "User updated successfully", data: sanitizedUser });
  } catch (error) { next(error); }
};
