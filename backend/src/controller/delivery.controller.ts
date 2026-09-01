import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

// ─── DRIVERS ─────────────────────────────────────────────────────────────

export const get_drivers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const drivers = await prisma.driver.findMany({
      where: { organization_id: orgId, is_active: true }
    });
    res.status(200).json({ data: drivers });
  } catch (error) { next(error); }
};

export const create_driver = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const { name, phone, vehicle_type, vehicle_plate } = req.body;
    
    const driver = await prisma.driver.create({
      data: {
        organization_id: orgId!,
        name, phone, vehicle_type, vehicle_plate
      }
    });
    res.status(201).json({ message: "Driver created", data: driver });
  } catch (error) { next(error); }
};

export const update_driver = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, phone, vehicle_type, vehicle_plate, is_active } = req.body;
    
    const driver = await prisma.driver.update({
      where: { id },
      data: { name, phone, vehicle_type, vehicle_plate, is_active }
    });
    res.status(200).json({ message: "Driver updated", data: driver });
  } catch (error) { next(error); }
};

export const delete_driver = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.driver.update({
      where: { id },
      data: { is_active: false }
    });
    res.status(200).json({ message: "Driver deactivated" });
  } catch (error) { next(error); }
};

// ─── DELIVERY ZONES ──────────────────────────────────────────────────────

export const get_delivery_zones = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.body?.branch_id;
    if (!branchId) return res.status(400).json({ message: "Branch ID required" });

    const zones = await prisma.deliveryZone.findMany({
      where: { branch_id: branchId, is_active: true }
    });
    res.status(200).json({ data: zones });
  } catch (error) { next(error); }
};

export const create_delivery_zone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.body?.branch_id;
    if (!branchId) return res.status(400).json({ message: "Branch ID required" });

    const { name, radius_km, delivery_fee, min_order_amount } = req.body;

    const zone = await prisma.deliveryZone.create({
      data: {
        branch_id: branchId,
        name, radius_km: Number(radius_km), delivery_fee: Number(delivery_fee), min_order_amount: Number(min_order_amount)
      }
    });
    res.status(201).json({ message: "Delivery zone created", data: zone });
  } catch (error) { next(error); }
};

export const update_delivery_zone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, radius_km, delivery_fee, min_order_amount, is_active } = req.body;

    const zone = await prisma.deliveryZone.update({
      where: { id },
      data: { name, radius_km: Number(radius_km), delivery_fee: Number(delivery_fee), min_order_amount: Number(min_order_amount), is_active }
    });
    res.status(200).json({ message: "Delivery zone updated", data: zone });
  } catch (error) { next(error); }
};

export const delete_delivery_zone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.deliveryZone.update({
      where: { id },
      data: { is_active: false }
    });
    res.status(200).json({ message: "Delivery zone deleted" });
  } catch (error) { next(error); }
};

// ─── DELIVERY ORDERS (DISPATCH) ──────────────────────────────────────────

export const get_active_deliveries = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.body?.branch_id;
    
    // Fetch orders that are DELIVERY type and not yet delivered
    // Includes their DeliveryOrder relation if it exists
    const deliveries = await prisma.deliveryOrder.findMany({
      where: {
        order: { branch_id: branchId, order_type: "DELIVERY" },
        status: { not: "DELIVERED" }
      },
      include: {
        order: {
          include: { customer: true }
        },
        driver: true
      },
      orderBy: { order: { created_at: 'asc' } }
    });
    
    // Also fetch raw Orders that are type DELIVERY but don't have a DeliveryOrder record yet
    const pendingRawOrders = await prisma.order.findMany({
      where: {
        branch_id: branchId,
        order_type: "DELIVERY",
        delivery: null,
        status: { notIn: ["COMPLETED", "CANCELLED"] }
      },
      include: { customer: true }
    });

    res.status(200).json({ 
      data: deliveries, 
      pending: pendingRawOrders 
    });
  } catch (error) { next(error); }
};

export const create_delivery_order = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { order_id, customer_address, delivery_fee } = req.body;
    const deliveryOrder = await prisma.deliveryOrder.create({
      data: {
        order_id,
        customer_address,
        delivery_fee: Number(delivery_fee),
        status: "PENDING"
      },
      include: { order: true, driver: true }
    });
    res.status(201).json({ message: "Delivery order created", data: deliveryOrder });
  } catch (error) { next(error); }
};

export const assign_driver = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // deliveryOrder ID
    const { driver_id, estimated_time } = req.body;

    const deliveryOrder = await prisma.deliveryOrder.update({
      where: { id },
      data: {
        driver_id,
        status: "ASSIGNED",
        estimated_time: estimated_time ? new Date(estimated_time) : null
      },
      include: { order: true, driver: true }
    });
    res.status(200).json({ message: "Driver assigned", data: deliveryOrder });
  } catch (error) { next(error); }
};

export const update_delivery_status = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // OUT_FOR_DELIVERY, DELIVERED

    const updateData: any = { status };
    if (status === "DELIVERED") {
      updateData.delivered_at = new Date();
    }

    const deliveryOrder = await prisma.deliveryOrder.update({
      where: { id },
      data: updateData,
      include: { order: true, driver: true }
    });
    
    // If delivered, maybe update the parent order status too
    if (status === "DELIVERED") {
      await prisma.order.update({
        where: { id: deliveryOrder.order_id },
        data: { status: "COMPLETED" }
      });
    }

    res.status(200).json({ message: "Status updated", data: deliveryOrder });
  } catch (error) { next(error); }
};
