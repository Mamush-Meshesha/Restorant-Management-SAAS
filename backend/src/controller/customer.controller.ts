import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';
import { hashPassword } from '../lib/password';

export const create_customer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const { name, phone, email, password } = req.body;
    let { first_name, last_name } = req.body;

    if (name && !first_name) {
      const parts = name.trim().split(' ');
      first_name = parts[0];
      last_name = parts.slice(1).join(' ') || undefined;
    }

    const customerPhone = phone || `reg_${Date.now()}`;

    // Create the customer
    const customer = await prisma.customer.create({
      data: {
        organization_id: orgId!,
        first_name: first_name || "Unknown",
        last_name: last_name,
        phone: customerPhone,
        email
      }
    });

    // If a password is provided, also create a User record so they can log in
    if (password && email) {
      let customerRole = await prisma.role.findFirst({
        where: { name: "Customer", organization_id: orgId }
      });
      
      if (!customerRole) {
        customerRole = await prisma.role.create({
          data: { name: "Customer", organization_id: orgId! }
        });
      }

      const hashedPassword = await hashPassword(password);
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

      await prisma.user.create({
        data: {
          username,
          email,
          password_hash: hashedPassword,
          first_name: first_name || "Unknown",
          last_name,
          organization_id: orgId!,
          role_id: customerRole.id,
        }
      });
    }

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

    const formattedCustomers = customers.map(c => ({
      ...c,
      name: `${c.first_name} ${c.last_name || ''}`.trim()
    }));

    res.status(200).json({ data: formattedCustomers });
  } catch (error) { next(error); }
};
