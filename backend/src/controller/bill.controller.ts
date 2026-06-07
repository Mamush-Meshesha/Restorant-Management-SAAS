import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const generate_bill = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { order_id } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: order_id }
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Dummy tax calculation (15%)
    const tax_amount = order.subtotal * 0.15;
    const total_amount = order.subtotal + tax_amount - order.discount_total;
    const bill_number = `INV-${Date.now().toString().slice(-6)}`;

    const bill = await prisma.bill.create({
      data: {
        order_id,
        bill_number,
        subtotal: order.subtotal,
        tax_amount,
        discount_amount: order.discount_total,
        total_amount,
        status: "UNPAID"
      }
    });

    res.status(201).json({ message: "Bill generated", data: bill });
  } catch (error) { next(error); }
};

export const checkout_bill = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { bill_id, payment_method, amount } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        bill_id,
        payment_method,
        amount
      }
    });

    // Update bill status
    const bill = await prisma.bill.update({
      where: { id: bill_id },
      data: { status: "PAID" }
    });

    // Update order status
    await prisma.order.update({
      where: { id: bill.order_id },
      data: { status: "CLOSED" }
    });

    res.status(200).json({ message: "Checkout completed", data: { bill, transaction } });
  } catch (error) { next(error); }
};
