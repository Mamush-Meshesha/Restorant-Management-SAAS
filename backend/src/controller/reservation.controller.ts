import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const create_reservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { table_id, customer_name, customer_phone, reservation_time, guest_count, special_requests, deposit_amount } = req.body;

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

    if (table_id && reservation_time) {
      const targetTime = new Date(reservation_time);
      const twoHoursBefore = new Date(targetTime.getTime() - 2 * 60 * 60 * 1000);
      const twoHoursAfter = new Date(targetTime.getTime() + 2 * 60 * 60 * 1000);
      
      const overlapping = await prisma.reservation.findFirst({
        where: {
          table_id,
          status: { notIn: ['CANCELLED'] },
          reservation_time: { gte: twoHoursBefore, lte: twoHoursAfter }
        }
      });
      if (overlapping) {
        return res.status(400).json({ message: "Table is already reserved for this time slot (2-hour window)." });
      }

      const now = new Date();
      const table = await prisma.table.findUnique({ where: { id: table_id } });
      if (table?.status === 'OCCUPIED' && targetTime.getTime() - now.getTime() < 2 * 60 * 60 * 1000) {
        return res.status(400).json({ message: "Table is currently occupied. Please select a time at least 2 hours from now, or choose another table." });
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
        special_requests,
        deposit_amount: deposit_amount || 0,
        status: deposit_amount > 0 ? 'PENDING_PAYMENT' : 'PENDING'
      },
      include: { table: true }
    });

    if (table_id) {
      await prisma.table.update({
        where: { id: table_id },
        data: { status: 'RESERVED' }
      });
    }

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
    } else {
      const { branchId, date } = req.query;
      if (branchId) {
        whereClause.table = { branch_id: String(branchId) };
      } else if (req.user?.branch_id) {
        whereClause.table = { branch_id: req.user.branch_id };
      }

      if (date) {
        const startOfDay = new Date(String(date));
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(String(date));
        endOfDay.setHours(23, 59, 59, 999);
        whereClause.reservation_time = { gte: startOfDay, lte: endOfDay };
      }
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
    } else if (status === 'CANCELLED') {
      await prisma.table.update({
        where: { id: reservation.table_id },
        data: { status: 'AVAILABLE' }
      });
    } else if (['PENDING', 'PENDING_PAYMENT', 'CONFIRMED'].includes(status)) {
      await prisma.table.update({
        where: { id: reservation.table_id },
        data: { status: 'RESERVED' }
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

export const update_reservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { table_id, customer_name, customer_phone, reservation_time, guest_count, special_requests, deposit_amount } = req.body;

    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Not found" });

    // Validate double booking if time or table changed
    if (reservation_time || table_id) {
      const targetTable = table_id || existing.table_id;
      const targetTime = reservation_time ? new Date(reservation_time) : existing.reservation_time;
      const twoHoursBefore = new Date(targetTime.getTime() - 2 * 60 * 60 * 1000);
      const twoHoursAfter = new Date(targetTime.getTime() + 2 * 60 * 60 * 1000);
      
      const overlapping = await prisma.reservation.findFirst({
        where: {
          id: { not: id },
          table_id: targetTable,
          status: { notIn: ['CANCELLED'] },
          reservation_time: { gte: twoHoursBefore, lte: twoHoursAfter }
        }
      });
      if (overlapping) {
        return res.status(400).json({ message: "Table is already reserved for this time slot (2-hour window)." });
      }

      const now = new Date();
      const table = await prisma.table.findUnique({ where: { id: targetTable } });
      if (table?.status === 'OCCUPIED' && targetTime.getTime() - now.getTime() < 2 * 60 * 60 * 1000) {
        return res.status(400).json({ message: "Table is currently occupied. Please select a time at least 2 hours from now, or choose another table." });
      }
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { 
        table_id, 
        customer_name, 
        customer_phone, 
        reservation_time: reservation_time ? new Date(reservation_time) : undefined, 
        guest_count, 
        special_requests, 
        deposit_amount 
      },
      include: { table: true }
    });
    res.status(200).json({ message: "Reservation updated", data: updated });
  } catch (error) { next(error); }
};

export const delete_reservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) return res.status(404).json({ message: "Not found" });
    
    await prisma.reservation.delete({ where: { id } });
    
    // Free up table if not cancelled
    if (reservation.table_id && reservation.status !== 'CANCELLED') {
      await prisma.table.update({ where: { id: reservation.table_id }, data: { status: 'AVAILABLE' } });
    }
    
    res.status(200).json({ message: "Reservation deleted" });
  } catch (error) { next(error); }
};

export const pay_reservation_deposit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body; // In a real app, you'd verify a Stripe/Square token here

    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    if (reservation.payment_status === 'PAID') {
      return res.status(400).json({ message: "Deposit is already paid" });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        payment_status: 'PAID',
        status: 'CONFIRMED' // Move to confirmed once paid
      }
    });

    // Notify Customer of confirmation
    if (updated.customer_id) {
      await prisma.notification.create({
        data: {
          user_id: updated.customer_id,
          title: "Reservation Confirmed",
          message: `Your deposit of $${updated.deposit_amount} was received. Reservation confirmed!`,
          type: "RESERVATION_UPDATE",
          is_read: false,
          organization_id: req.user?.organization_id || (await prisma.organization.findFirst())!.id
        }
      });
    }

    res.status(200).json({ message: "Deposit paid successfully", data: updated });
  } catch (error) { next(error); }
};

export const get_available_tables = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { reservation_time, guest_count, branch_id, area_id } = req.query;

    if (!reservation_time || !guest_count || !branch_id) {
      return res.status(400).json({ message: "reservation_time, guest_count, and branch_id are required" });
    }

    const targetTime = new Date(String(reservation_time));
    if (isNaN(targetTime.getTime())) {
      return res.status(400).json({ message: "Invalid reservation_time format" });
    }

    const guests = parseInt(String(guest_count), 10);
    const twoHoursBefore = new Date(targetTime.getTime() - 2 * 60 * 60 * 1000);
    const twoHoursAfter = new Date(targetTime.getTime() + 2 * 60 * 60 * 1000);

    const whereClause: any = {
      branch_id: String(branch_id),
      capacity: { gte: guests },
      status: "AVAILABLE",
    };

    // We removed backend area filtering to allow the frontend to dynamically
    // generate filter categories based on the actual DiningAreas returned.

    const tables = await prisma.table.findMany({
      where: whereClause,
      include: { diningArea: true }
    });

    const overlappingReservations = await prisma.reservation.findMany({
      where: {
        table: { branch_id: String(branch_id) },
        status: { notIn: ['CANCELLED'] },
        reservation_time: { gte: twoHoursBefore, lte: twoHoursAfter }
      },
      select: { table_id: true }
    });

    const bookedTableIds = new Set(overlappingReservations.map(r => r.table_id));

    const availableTables = tables.filter(t => !bookedTableIds.has(t.id));

    res.status(200).json({ data: availableTables });
  } catch (error) { next(error); }
};

export const get_time_slots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branch_id, date, guest_count } = req.query;
    if (!branch_id || !date || !guest_count) {
      return res.status(400).json({ message: "branch_id, date, and guest_count are required" });
    }

    const branch = await prisma.branch.findUnique({
      where: { id: String(branch_id) }
    });

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const guests = parseInt(String(guest_count), 10);
    const targetDateStr = String(date); 
    const [year, month, day] = targetDateStr.split("-").map(Number);

    const openTime = branch.opening_time || "09:00";
    const closeTime = branch.closing_time || "22:00";
    const [openH, openM] = openTime.split(':').map(Number);
    let [closeH, closeM] = closeTime.split(':').map(Number);
    if (closeH < openH) closeH += 24;

    const tables = await prisma.table.findMany({
      where: {
        branch_id: String(branch_id),
        capacity: { gte: guests },
        status: "AVAILABLE",
      }
    });

    const startOfFetch = new Date(year, month - 1, day, 0, 0, 0);
    const endOfFetch = new Date(year, month - 1, day + 1, 6, 0, 0);
    
    const reservations = await prisma.reservation.findMany({
      where: {
        table: { branch_id: String(branch_id) },
        status: { notIn: ['CANCELLED'] },
        reservation_time: { gte: startOfFetch, lte: endOfFetch }
      },
      select: { table_id: true, reservation_time: true }
    });

    const slots = [];
    
    let currentH = openH;
    let currentM = openM;

    while (currentH < closeH || (currentH === closeH && currentM <= closeM)) {
      const displayH = currentH % 24;
      const ampm = displayH >= 12 && displayH < 24 ? "PM" : "AM";
      let formatH = displayH % 12;
      if (formatH === 0) formatH = 12;
      const formatM = currentM === 0 ? "00" : currentM.toString();
      const timeStr = `${formatH}:${formatM} ${ampm}`;

      const slotTime = new Date(year, month - 1, day, currentH % 24, currentM, 0);
      const twoHoursBefore = slotTime.getTime() - 2 * 60 * 60 * 1000;
      const twoHoursAfter = slotTime.getTime() + 2 * 60 * 60 * 1000;

      const overlapping = reservations.filter(r => {
        const t = new Date(r.reservation_time).getTime();
        return t >= twoHoursBefore && t <= twoHoursAfter;
      });

      const bookedTableIds = new Set(overlapping.map(r => r.table_id));
      const availableTables = tables.filter(t => !bookedTableIds.has(t.id));
      
      const now = new Date();
      let isAvailable = availableTables.length > 0;
      
      if (slotTime.getTime() < now.getTime()) {
        isAvailable = false;
      }

      slots.push({
        time: timeStr,
        available: isAvailable
      });

      currentM += 30;
      if (currentM >= 60) {
        currentH += 1;
        currentM -= 60;
      }
    }

    res.status(200).json({ data: slots });
  } catch (error) { next(error); }
};
