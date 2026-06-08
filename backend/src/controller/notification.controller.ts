import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const get_notifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const notifications = await prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50
    });

    res.status(200).json({ data: notifications });
  } catch (error) {
    next(error);
  }
};

export const mark_as_read = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { user_id: userId, is_read: false },
        data: { is_read: true }
      });
    } else {
      await prisma.notification.update({
        where: { id },
        data: { is_read: true }
      });
    }

    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    next(error);
  }
};
