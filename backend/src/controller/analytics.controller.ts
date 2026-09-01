import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const create_expense = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.body.branch_id;
    const { category_id, amount, date, reference, notes } = req.body;

    const expense = await prisma.expense.create({
      data: {
        branch_id: branchId,
        category_id,
        amount,
        date: new Date(date),
        reference,
        notes
      }
    });

    res.status(201).json({ message: "Expense recorded", data: expense });
  } catch (error) { next(error); }
};

export const get_expenses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.query.branchId as string;
    const { from, to } = req.query;

    const expenses = await prisma.expense.findMany({
      where: {
        branch_id: branchId,
        ...(from && to && {
          date: {
            gte: new Date(from as string),
            lte: new Date(to as string)
          }
        })
      },
      include: { category: true },
      orderBy: { date: 'desc' }
    });

    res.status(200).json({ data: expenses });
  } catch (error) { next(error); }
};

export const get_revenue_summary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.query.branchId as string;
    const { from, to } = req.query;

    const fromDate = from ? new Date(from as string) : new Date(new Date().setDate(new Date().getDate() - 30));
    const toDate = to ? new Date(to as string) : new Date();

    // Aggregate orders within date range
    const orderStats = await prisma.order.aggregate({
      where: {
        branch_id: branchId,
        status: 'CLOSED',
        created_at: { gte: fromDate, lte: toDate }
      },
      _sum: { subtotal: true, tax_total: true, discount_total: true, total_amount: true },
      _count: { id: true }
    });

    // Aggregate expenses
    const expenseStats = await prisma.expense.aggregate({
      where: {
        branch_id: branchId,
        date: { gte: fromDate, lte: toDate }
      },
      _sum: { amount: true }
    });

    const grossRevenue = orderStats._sum.total_amount || 0;
    const totalExpenses = expenseStats._sum.amount || 0;

    res.status(200).json({
      data: {
        period: { from: fromDate, to: toDate },
        gross_revenue: grossRevenue,
        total_tax_collected: orderStats._sum.tax_total || 0,
        total_discounts: orderStats._sum.discount_total || 0,
        total_expenses: totalExpenses,
        net_profit: grossRevenue - totalExpenses,
        order_count: orderStats._count.id
      }
    });
  } catch (error) { next(error); }
};

export const get_daily_revenue = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.query.branchId as string;
    const { from, to } = req.query;

    const fromDate = from ? new Date(from as string) : new Date(new Date().setDate(new Date().getDate() - 7));
    const toDate = to ? new Date(to as string) : new Date();

    const reports = await prisma.revenueReport.findMany({
      where: {
        branch_id: branchId,
        date: { gte: fromDate, lte: toDate }
      },
      orderBy: { date: 'asc' }
    });

    res.status(200).json({ data: reports });
  } catch (error) { next(error); }
};

export const get_expense_categories = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    if (!orgId) return res.status(400).json({ message: "Organization ID is required" });

    const categories = await prisma.expenseCategory.findMany({
      where: { organization_id: orgId },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({ data: categories });
  } catch (error) { next(error); }
};

export const create_expense_category = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    if (!orgId) return res.status(400).json({ message: "Organization ID is required" });
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const category = await prisma.expenseCategory.create({
      data: {
        organization_id: orgId,
        name
      }
    });

    res.status(201).json({ message: "Expense category created", data: category });
  } catch (error) { next(error); }
};
