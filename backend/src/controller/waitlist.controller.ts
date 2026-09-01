import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { io } from '../socket';

export const join_waitlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branch_id, customer_name, customer_phone, guest_count, deposit_amount } = req.body;

    if (!branch_id || !customer_name || !customer_phone || !guest_count) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Estimate wait time (e.g., 5 mins per person currently waiting)
    const waitingCount = await prisma.waitlist.count({
      where: { branch_id, status: 'WAITING' }
    });
    const quoted_time = (waitingCount + 1) * 5;

    const waitlistItem = await prisma.waitlist.create({
      data: {
        branch_id,
        customer_name,
        customer_phone,
        guest_count: parseInt(guest_count),
        quoted_time,
        status: (deposit_amount && deposit_amount > 0) ? 'WAITING_PAYMENT' : 'WAITING',
        deposit_amount: deposit_amount ? parseFloat(deposit_amount) : 0
      }
    });

    // Notify the branch dashboard that a new customer joined
    io.to(`waitlist_${branch_id}`).emit("waitlist_updated", { action: 'JOIN', waitlistItem });

    res.status(201).json({
      message: "Successfully joined waitlist",
      data: waitlistItem,
      position: waitingCount + 1
    });
  } catch (error) { next(error); }
};

export const get_waitlist_status = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const waitlistItem = await prisma.waitlist.findUnique({ where: { id } });
    if (!waitlistItem) {
      return res.status(404).json({ message: "Waitlist entry not found" });
    }

    // Find position in queue
    const waitingList = await prisma.waitlist.findMany({
      where: { branch_id: waitlistItem.branch_id, status: 'WAITING' },
      orderBy: { created_at: 'asc' }
    });

    const position = waitingList.findIndex(item => item.id === waitlistItem.id) + 1;

    res.status(200).json({
      data: waitlistItem,
      position: position > 0 ? position : null // If not WAITING anymore
    });
  } catch (error) { next(error); }
};

// Mock SMS Service for Enterprise Notification Architecture
const send_sms_notification = (phone: string, message: string) => {
  console.log(`[SMS MOCK] Sending to ${phone}: ${message}`);
  // TODO: Drop in Twilio / AWS SNS client here
};

// Staff endpoint to update status
export const update_waitlist_status = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // NOTIFIED, SEATED, LEFT

    const waitlistItem = await prisma.waitlist.update({
      where: { id },
      data: { status }
    });

    if (status === 'NOTIFIED') {
      send_sms_notification(
        waitlistItem.customer_phone, 
        `Your table is ready at ${waitlistItem.branch_id}! Please check in at the host stand within 10 minutes.`
      );
    }

    // Notify customers in queue that the line moved
    io.to(`waitlist_${waitlistItem.branch_id}`).emit("waitlist_updated", { action: 'UPDATE', waitlistItem });

    res.status(200).json({ message: "Status updated", data: waitlistItem });
  } catch (error) { next(error); }
};

export const seat_waitlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { table_id } = req.body;

    if (!table_id) return res.status(400).json({ message: "Table ID is required" });

    // Run within a transaction to ensure atomic seating
    const result = await prisma.$transaction(async (tx) => {
      const waitlist = await tx.waitlist.findUnique({ where: { id } });
      if (!waitlist) throw new Error("Waitlist item not found");
      if (waitlist.status === 'SEATED') throw new Error("Party is already seated");

      const table = await tx.table.findUnique({ where: { id: table_id } });
      if (!table) throw new Error("Table not found");
      if (table.status === 'OCCUPIED') throw new Error("Table is already occupied");

      // Mark Table as OCCUPIED
      const updatedTable = await tx.table.update({
        where: { id: table_id },
        data: { status: 'OCCUPIED' }
      });

      // Mark Waitlist as SEATED
      const updatedWaitlist = await tx.waitlist.update({
        where: { id },
        data: { status: 'SEATED' }
      });

      return { waitlist: updatedWaitlist, table: updatedTable };
    });

    // Notify clients of the changes
    io.to(`waitlist_${result.waitlist.branch_id}`).emit("waitlist_updated", { action: 'UPDATE', waitlistItem: result.waitlist });
    io.to(`branch_${result.waitlist.branch_id}`).emit("table_updated", { action: 'UPDATE', table: result.table });

    res.status(200).json({ message: "Successfully seated waitlist party", data: result });
  } catch (error: any) {
    if (error.message.includes("already occupied") || error.message.includes("already seated") || error.message.includes("not found")) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const get_branch_waitlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId } = req.params;
    const list = await prisma.waitlist.findMany({
      where: { 
        branch_id: branchId,
        status: { in: ['WAITING', 'NOTIFIED'] }
      },
      orderBy: { created_at: 'asc' }
    });
    
    res.status(200).json({ data: list });
  } catch (error) { next(error); }
};

export const pay_waitlist_deposit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;

    const waitlistItem = await prisma.waitlist.findUnique({ where: { id } });
    if (!waitlistItem) return res.status(404).json({ message: "Waitlist not found" });

    if (waitlistItem.payment_status === 'PAID') {
      return res.status(400).json({ message: "Deposit is already paid" });
    }

    const updated = await prisma.waitlist.update({
      where: { id },
      data: {
        payment_status: 'PAID',
        status: 'WAITING' // Moves from WAITING_PAYMENT to actually WAITING in queue
      }
    });

    res.status(200).json({ message: "Waitlist deposit paid successfully", data: updated });
  } catch (error) { next(error); }
};
