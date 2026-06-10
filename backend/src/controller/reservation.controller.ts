import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const create_reservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { table_id, customer_name, customer_phone, reservation_time, guest_count, special_requests } = req.body;

    const isCustomer = req.user?.role_name?.toUpperCase() === 'CUSTOMER';
    let customerId = undefined;
    
    if (isCustomer && req.user?.email) {
      let customerRecord = await prisma.customer.findFirst({
        where: { email: req.user.email }
      });
      
      // Auto-create customer record if it doesn't exist for this authenticated user
      if (!customerRecord && req.user) {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        customerRecord = await prisma.customer.create({
          data: {
            email: req.user.email,
            first_name: user?.first_name || "Unknown",
            last_name: user?.last_name || "",
            phone: `auto_${Date.now()}`,
            organization_id: req.user.organization_id,
          }
        });
      }

      if (customerRecord) {
        customerId = customerRecord.id;
      }
    }

    const reservation = await prisma.reservation.create({
      data: {
        table_id,
        customer_id: customerId,
        customer_name,
        customer_phone,
        reservation_time: new Date(reservation_time),
        guest_count,
        special_requests
      },
      include: { table: true }
    });

    // --- Notify Staff ---
    if (reservation.table?.branch_id) {
      const staff = await prisma.user.findMany({
        where: { branch_id: reservation.table.branch_id }
      });
      if (staff.length > 0) {
        const orgId = req.user?.organization_id || (await prisma.organization.findFirst())!.id;
        const notifs = staff.map(user => ({
          user_id: user.id,
          title: "New Reservation",
          message: `Reservation for ${customer_name} (${guest_count} guests) at ${new Date(reservation_time).toLocaleTimeString()}`,
          type: "RESERVATION_NEW",
          is_read: false,
          organization_id: orgId
        }));
        await prisma.notification.createMany({ data: notifs });
      }
    }

    res.status(201).json({ message: "Reservation created", data: reservation });
  } catch (error) { next(error); }
};

export const get_reservations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const isCustomer = req.user?.role_name?.toUpperCase() === 'CUSTOMER';
    const whereClause: any = {};
    
    if (isCustomer && req.user?.email) {
      let customerRecord = await prisma.customer.findFirst({
        where: { email: req.user.email }
      });

      if (!customerRecord && req.user) {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        customerRecord = await prisma.customer.create({
          data: {
            email: req.user.email,
            first_name: user?.first_name || "Unknown",
            last_name: user?.last_name || "",
            phone: `auto_${Date.now()}`,
            organization_id: req.user.organization_id,
          }
        });
      }

      whereClause.customer_id = customerRecord ? customerRecord.id : 'not_found';
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
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

    // --- Notify Customer ---
    if (reservation.customer_id) {
      await prisma.notification.create({
        data: {
          user_id: reservation.customer_id,
          title: "Reservation Update",
          message: `Your reservation status is now ${status}.`,
          type: "RESERVATION_UPDATE",
          is_read: false,
          organization_id: req.user?.organization_id || (await prisma.organization.findFirst())!.id
        }
      });
    }

    res.status(200).json({ message: "Status updated", data: reservation });
  } catch (error) { next(error); }
};
