import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';
import { createAuditLog } from '../lib/auditTrail';

export const open_register = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { branch_id, starting_float } = req.body;
    const userId = req.user?.id;
    const orgId = req.user?.organizationId || req.user?.instituteId;

    if (!userId || !orgId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user already has an open register
    const existingSession = await prisma.cashDrawerSession.findFirst({
      where: {
        opened_by_id: userId,
        status: 'OPEN'
      }
    });

    if (existingSession) {
      return res.status(400).json({ message: "You already have an open register session." });
    }

    const session = await prisma.cashDrawerSession.create({
      data: {
        branch_id,
        opened_by_id: userId,
        starting_float: starting_float || 0,
        status: 'OPEN'
      }
    });

    await createAuditLog({
      entity_type: 'CASH_DRAWER',
      entity_id: session.id,
      action: 'OPEN',
      user_id: userId,
      organization_id: orgId,
      ip_address: req.ip,
      details: { starting_float }
    });

    res.status(201).json({
      message: "Register opened successfully",
      data: session
    });
  } catch (error) { next(error); }
};

export const close_register = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { session_id, actual_cash, notes } = req.body;
    const userId = req.user?.id;
    const orgId = req.user?.organizationId || req.user?.instituteId;

    if (!userId || !orgId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await prisma.cashDrawerSession.findUnique({
      where: { id: session_id }
    });

    if (!session || session.status === 'CLOSED') {
      return res.status(400).json({ message: "Active register session not found." });
    }

    // Ensure the user closing it is a Manager, Admin, or the one who opened it
    if (session.opened_by_id !== userId && req.user?.role_name !== 'BRANCH_MANAGER' && req.user?.role_name !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Forbidden: You cannot close someone else's register." });
    }

    // Calculate total cash transactions during this session
    const cashTransactions = await prisma.transaction.aggregate({
      where: {
        cash_drawer_session_id: session.id,
        payment_method: 'CASH',
        status: 'COMPLETED' // Assuming completed cash transactions
      },
      _sum: {
        amount: true,
        tip_amount: true
      }
    });

    const totalCashAdded = (cashTransactions._sum.amount || 0) + (cashTransactions._sum.tip_amount || 0);
    const expected_cash = session.starting_float + totalCashAdded;
    const variance = actual_cash - expected_cash;

    const updatedSession = await prisma.cashDrawerSession.update({
      where: { id: session_id },
      data: {
        status: 'CLOSED',
        closed_by_id: userId,
        closed_at: new Date(),
        expected_cash,
        actual_cash,
        variance,
        notes
      }
    });

    await createAuditLog({
      entity_type: 'CASH_DRAWER',
      entity_id: session.id,
      action: 'CLOSE',
      user_id: userId,
      organization_id: orgId,
      ip_address: req.ip,
      details: { expected_cash, actual_cash, variance }
    });

    res.status(200).json({
      message: "Register closed successfully",
      data: updatedSession
    });
  } catch (error) { next(error); }
};

export const get_active_register = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await prisma.cashDrawerSession.findFirst({
      where: {
        opened_by_id: userId,
        status: 'OPEN'
      }
    });

    res.status(200).json({ data: session });
  } catch (error) { next(error); }
};
