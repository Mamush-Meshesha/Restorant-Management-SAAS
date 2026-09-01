import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const get_loyalty_data = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    if (!orgId) return res.status(400).json({ message: "Organization ID is required" });

    // Fetch or create program
    let program = await prisma.loyaltyProgram.findFirst({
      where: { organization_id: orgId }
    });

    if (!program) {
      program = await prisma.loyaltyProgram.create({
        data: { organization_id: orgId }
      });
    }

    const tiers = await prisma.customerTier.findMany({
      where: { organization_id: orgId },
      orderBy: { min_points: 'asc' }
    });

    // Recent 50 transactions
    const recentTransactions = await prisma.loyaltyTransaction.findMany({
      where: { customer: { organization_id: orgId } },
      include: { customer: { select: { first_name: true, last_name: true, phone: true } } },
      orderBy: { created_at: 'desc' },
      take: 50
    });

    res.status(200).json({
      data: {
        program,
        tiers,
        recentTransactions: recentTransactions.map(t => ({
          id: t.id,
          customer: `${t.customer.first_name || ''} ${t.customer.last_name || ''}`.trim() || t.customer.phone || 'Unknown',
          type: t.type,
          points: t.points,
          order_id: t.reference || '-',
          date: t.created_at
        }))
      }
    });
  } catch (error) { next(error); }
};

export const update_loyalty_program = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    if (!orgId) return res.status(400).json({ message: "Organization ID required" });

    const { points_per_currency, min_redemption, is_active } = req.body;

    let program = await prisma.loyaltyProgram.findFirst({
      where: { organization_id: orgId }
    });

    if (program) {
      program = await prisma.loyaltyProgram.update({
        where: { id: program.id },
        data: { points_per_currency: Number(points_per_currency), min_redemption: Number(min_redemption), is_active }
      });
    } else {
      program = await prisma.loyaltyProgram.create({
        data: { organization_id: orgId, points_per_currency: Number(points_per_currency), min_redemption: Number(min_redemption), is_active }
      });
    }

    res.status(200).json({ data: program });
  } catch (error) { next(error); }
};

export const create_tier = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    if (!orgId) return res.status(400).json({ message: "Organization ID required" });

    const { name, min_points, discount_rate } = req.body;

    const tier = await prisma.customerTier.create({
      data: {
        organization_id: orgId,
        name,
        min_points: Number(min_points),
        discount_rate: discount_rate ? Number(discount_rate) : 0
      }
    });

    res.status(201).json({ data: tier });
  } catch (error) { next(error); }
};

export const delete_tier = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.customerTier.delete({ where: { id } });
    res.status(200).json({ message: "Tier deleted successfully" });
  } catch (error) { next(error); }
};
