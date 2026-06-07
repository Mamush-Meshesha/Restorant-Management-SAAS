import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const create_customer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const { first_name, last_name, phone, email } = req.body;

    const customer = await prisma.customer.create({
      data: {
        organization_id: orgId!,
        first_name,
        last_name,
        phone,
        email
      }
    });

    res.status(201).json({ message: "Customer created", data: customer });
  } catch (error) { next(error); }
};

export const get_customers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const customers = await prisma.customer.findMany({
      where: { organization_id: orgId },
      include: { tier: true }
    });

    res.status(200).json({ data: customers });
  } catch (error) { next(error); }
};
