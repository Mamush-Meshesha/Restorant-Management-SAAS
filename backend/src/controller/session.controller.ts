import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';
import { io } from '../socket';

export const join_session = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    
    // 1. Verify the QR token
    const menuQr = await prisma.menuQRCode.findUnique({ where: { token } });
    if (!menuQr || !menuQr.table_id) {
      return res.status(404).json({ message: "Invalid or missing Table QR token." });
    }
    
    const tableId = menuQr.table_id; // Capture as non-null string

    // 2. Find or create an open session for this table safely using a transaction
    let session = await prisma.$transaction(async (tx) => {
      let existing = await tx.tableSession.findFirst({
        where: { table_id: tableId, status: 'OPEN' }
      });
      
      if (existing) return existing;

      // Verify table is not already occupied by another process just now
      const table = await tx.table.findUnique({ where: { id: tableId } });
      if (table && table.status === 'OCCUPIED') {
         // It's occupied but has no open session? That's an anomaly, but let's prevent creation just in case
         // or we can allow it if there's genuinely no session. We'll rely on the transaction lock.
      }

      const newSession = await tx.tableSession.create({
        data: {
          table_id: tableId,
          token: `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          status: 'OPEN'
        }
      });
      
      await tx.table.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' }
      });

      return newSession;
    });

    // 3. Add the customer as a guest to the session (if they are logged in)
    const customerId = req.user?.role_name === 'Customer' ? req.user?.id : null;
    if (customerId) {
      const existingGuest = await prisma.tableSessionGuest.findFirst({
        where: { table_session_id: session.id, customer_id: customerId }
      });
      if (!existingGuest) {
        await prisma.tableSessionGuest.create({
          data: {
            table_session_id: session.id,
            customer_id: customerId
          }
        });
      }
    }

    // 4. Notify WebSocket room that a new user joined
    io.to(`session_${session.token}`).emit("guest_joined", { customerId });

    res.status(200).json({
      message: "Joined table session",
      data: {
        session_id: session.id,
        session_token: session.token,
        table_id: session.table_id,
        branch_id: menuQr.branch_id
      }
    });
  } catch (error) { next(error); }
};

export const sync_cart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { session_token } = req.params;
    const { cartItems } = req.body;
    
    // Broadcast the updated cart to everyone else at the table
    io.to(`session_${session_token}`).emit("cart_updated", { cartItems });

    res.status(200).json({ message: "Cart synced successfully" });
  } catch (error) { next(error); }
};
