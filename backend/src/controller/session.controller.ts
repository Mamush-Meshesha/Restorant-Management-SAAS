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

    // 2. Find or create an open session for this table
    let session = await prisma.tableSession.findFirst({
      where: { table_id: menuQr.table_id, status: 'OPEN' }
    });

    if (!session) {
      session = await prisma.tableSession.create({
        data: {
          table_id: menuQr.table_id,
          token: `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          status: 'OPEN'
        }
      });
      
      // Update table status to occupied
      await prisma.table.update({
        where: { id: menuQr.table_id },
        data: { status: 'OCCUPIED' }
      });
    }

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
        table_id: session.table_id
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
