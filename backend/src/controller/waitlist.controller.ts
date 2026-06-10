import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { io } from '../socket';

export const join_waitlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branch_id, customer_name, customer_phone, guest_count } = req.body;

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
        status: 'WAITING'
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

// Staff endpoint to update status
export const update_waitlist_status = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // NOTIFIED, SEATED, LEFT

    const waitlistItem = await prisma.waitlist.update({
      where: { id },
      data: { status }
    });

    // Notify customers in queue that the line moved
    io.to(`waitlist_${waitlistItem.branch_id}`).emit("waitlist_updated", { action: 'UPDATE', waitlistItem });

    res.status(200).json({ message: "Status updated", data: waitlistItem });
  } catch (error) { next(error); }
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
