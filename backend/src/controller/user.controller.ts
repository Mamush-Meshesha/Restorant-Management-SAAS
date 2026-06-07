import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';
import { hashPassword } from '../lib/password';

export const create_user = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const { branch_id, role_id, username, email, password, first_name, last_name } = req.body;

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
    const users = await prisma.user.findMany({
      where: { organization_id: orgId },
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
