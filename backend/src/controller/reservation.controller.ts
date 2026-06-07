import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const create_reservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { table_id, customer_name, customer_phone, reservation_time, guest_count, special_requests } = req.body;

    const reservation = await prisma.reservation.create({
      data: {
        table_id,
        customer_name,
        customer_phone,
        reservation_time: new Date(reservation_time),
        guest_count,
        special_requests
      }
    });

    res.status(201).json({ message: "Reservation created", data: reservation });
  } catch (error) { next(error); }
};

export const get_reservations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // In a real app filter by branch tables
    const reservations = await prisma.reservation.findMany({
      include: { table: true },
      orderBy: { reservation_time: 'asc' }
    });

    res.status(200).json({ data: reservations });
  } catch (error) { next(error); }
};

export const update_reservation_status = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // CONFIRMED, SEATED, CANCELLED

    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status }
    });

    if (status === 'SEATED') {
      await prisma.table.update({
        where: { id: reservation.table_id },
        data: { status: 'OCCUPIED' }
      });
    }

    res.status(200).json({ message: "Status updated", data: reservation });
  } catch (error) { next(error); }
};
