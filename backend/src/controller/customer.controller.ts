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
    const isSuperAdmin = req.user?.role_name === 'SUPERADMIN';
    
    const whereClause: any = {};
    if (!isSuperAdmin) {
      whereClause.organization_id = orgId;
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: { tier: true }
    });

    const formattedCustomers = customers.map(c => ({
      ...c,
      name: `${c.first_name} ${c.last_name || ''}`.trim()
    }));

    res.status(200).json({ data: formattedCustomers });
  } catch (error) { next(error); }
};

export const get_my_profile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const customer = await prisma.customer.findFirst({
      where: { email: req.user.email },
      include: { 
        tier: true,
        orders: { select: { id: true, total_amount: true } },
      }
    });

    if (!customer) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      // Fallback: If customer record not found for this user, return a default shell
      return res.status(200).json({ 
        data: {
          first_name: user?.first_name || "Unknown",
          last_name: user?.last_name || "",
          email: req.user.email,
          loyalty_points: 0,
          total_visits: 0,
          money_saved: 0,
          tier: { name: "Bronze", min_points: 0 }
        } 
      });
    }

    // Calculate visits and spending
    const total_visits = customer.orders.length;
    const total_spent = customer.orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    res.status(200).json({ 
      data: {
        ...customer,
        total_visits,
        total_spent,
      } 
    });
  } catch (error) { next(error); }
};
