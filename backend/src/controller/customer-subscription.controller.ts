import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const get_subscription_plans = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const plans = await prisma.customerSubscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    });
    res.status(200).json({ data: plans });
  } catch (error) { next(error); }
};

export const get_my_subscriptions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.email) return res.status(401).json({ message: "Not authenticated" });
    
    const customer = await prisma.customer.findFirst({ where: { email: req.user.email } });
    if (!customer) return res.status(404).json({ message: "Customer profile not found" });

    const subscriptions = await prisma.customerSubscription.findMany({
      where: { customer_id: customer.id },
      include: { plan: true }
    });

    res.status(200).json({ data: subscriptions });
  } catch (error) { next(error); }
};

export const subscribe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.email) return res.status(401).json({ message: "Not authenticated" });
    const { plan_id } = req.body;

    const customer = await prisma.customer.findFirst({ where: { email: req.user.email } });
    if (!customer) return res.status(404).json({ message: "Customer profile not found" });

    const plan = await prisma.customerSubscriptionPlan.findUnique({ where: { id: plan_id } });
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // In a real app, process payment here via Stripe

    const nextBilling = new Date();
    if (plan.billing_cycle === 'MONTHLY') nextBilling.setMonth(nextBilling.getMonth() + 1);
    else if (plan.billing_cycle === 'YEARLY') nextBilling.setFullYear(nextBilling.getFullYear() + 1);

    const subscription = await prisma.customerSubscription.create({
      data: {
        customer_id: customer.id,
        plan_id: plan.id,
        status: 'ACTIVE',
        next_billing: nextBilling
      },
      include: { plan: true }
    });

    res.status(201).json({ message: "Successfully subscribed", data: subscription });
  } catch (error) { next(error); }
};
