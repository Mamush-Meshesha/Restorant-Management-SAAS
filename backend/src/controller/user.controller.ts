import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';
import { hashPassword } from '../lib/password';

export const create_user = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const isManager = req.user?.role_name === 'BRANCH_MANAGER';
    
    // Managers can only create users in their own branch
    const branch_id = isManager ? req.user?.branch_id : req.body.branch_id;
    const { role_id, username, email, password, first_name, last_name } = req.body;

    // Security check: Only SUPERADMIN can assign SUPERADMIN role
    if (role_id) {
      const assignedRole = await prisma.role.findUnique({ where: { id: role_id } });
      if (assignedRole?.name === 'SUPERADMIN' && req.user?.role_name !== 'SUPERADMIN') {
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
    const isManager = req.user?.role_name === 'BRANCH_MANAGER';
    
    const whereClause: any = { organization_id: orgId };
    
    // Managers can only see users in their own branch
    if (isManager && req.user?.branch_id) {
      whereClause.branch_id = req.user.branch_id;
    }

    // Role-based filtering
    const roleFilters: any[] = [];
    
    // Hide 'Customer' role users from the user list
    roleFilters.push({ name: { not: 'Customer' } });

    // Only SUPERADMIN can see other SUPERADMINs
    if (req.user?.role_name !== 'SUPERADMIN') {
      roleFilters.push({ name: { not: 'SUPERADMIN' } });
    }

    if (roleFilters.length > 0) {
      whereClause.role = { AND: roleFilters };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        role: true,
        branch: true
      }
    });

    // Exclude password hashes
    const sanitizedUsers = users.map(({ password_hash, ...rest }) => rest);

    res.status(200).json({ data: sanitizedUsers });
  } catch (error) { next(error); }
};
