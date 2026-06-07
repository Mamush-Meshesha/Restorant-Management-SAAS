import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

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

    res.status(201).json({ message: "Role created", data: role });
  } catch (error) { next(error); }
};

export const get_roles = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const roles = await prisma.role.findMany({
      where: { organization_id: orgId },
      include: { permissions: true }
    });

    res.status(200).json({ data: roles });
  } catch (error) { next(error); }
};
