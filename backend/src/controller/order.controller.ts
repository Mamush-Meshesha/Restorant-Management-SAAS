import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const create_order = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let branchId = req.user?.branch_id || req.body.branch_id;
    if (!branchId) {
      const firstBranch = await prisma.branch.findFirst();
      if (!firstBranch) return res.status(400).json({ message: "No branch found to assign order" });
      branchId = firstBranch.id;
    }
    const { table_id, order_type, items } = req.body; // items: [{ menu_item_id, quantity, notes }]
    
    // Calculate totals
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menu_item_id } });
      if (!menuItem) continue;

      const itemTotal = menuItem.base_price * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: menuItem.base_price,
        total_price: itemTotal,
        notes: item.notes
      });
    }

    const isCustomer = req.user?.role_name === 'Customer';
    let customerId = null;
    if (isCustomer && req.user?.email) {
      const customerRecord = await prisma.customer.findFirst({
        where: { email: req.user.email }
      });
      if (customerRecord) {
        customerId = customerRecord.id;
      }
    }
    
    const order = await prisma.order.create({
      data: {
        branch_id: branchId,
        table_id,
        order_type: order_type || 'DINE_IN',
        waiter_id: isCustomer ? null : req.user?.id,
        customer_id: isCustomer ? customerId : null,
        subtotal,
        total_amount: subtotal, // Without tax for now
        items: {
          create: orderItemsData
        }
      },
      include: { items: true }
    });

    // --- Generate Kitchen Orders ---
    // Find a kitchen station for this branch (fallback to any station if none specific)
    let station = await prisma.kitchenStation.findFirst({ where: { branch_id: branchId } });
    if (!station) {
      // Create a default station if none exists for this branch
      station = await prisma.kitchenStation.create({
        data: { branch_id: branchId, name: "Main Kitchen" }
      });
    }

    if (station && order.items) {
      const kitchenOrdersData = order.items.map(item => ({
        station_id: station!.id,
        order_item_id: item.id,
        status: 'PENDING'
      }));
      await prisma.kitchenOrder.createMany({ data: kitchenOrdersData });
    }

    // --- Notify Staff ---
    const staff = await prisma.user.findMany({
      where: { branch_id: branchId }
    });
    
    if (staff.length > 0) {
      const orgId = req.user?.organization_id || (await prisma.organization.findFirst())!.id;
      const notifs = staff.map(user => ({
        user_id: user.id,
        title: "New Order Received",
        message: `Order #${order.id.slice(0, 8).toUpperCase()} has been placed.`,
        type: "ORDER_NEW",
        is_read: false,
        organization_id: orgId
      }));
      await prisma.notification.createMany({ data: notifs });
    }

    res.status(201).json({ message: "Order created successfully", data: order });
  } catch (error) { next(error); }
};

export const get_orders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const isCustomer = req.user?.role_name === 'Customer';
    const branchId = isCustomer ? req.query.branchId as string : (req.user?.branch_id || req.query.branchId as string);
    const status = req.query.status as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const whereClause: any = {};
    if (branchId) whereClause.branch_id = branchId;      // Superadmins have no branch_id → see all
    if (status) whereClause.status = status;
    
    // Customers can ONLY see their own orders
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

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        table: true,
        items: {
          include: { menuItem: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    res.status(200).json({ data: orders });
  } catch (error) { next(error); }
};

export const update_order_status = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Get the order first to check if there is a customer attached
    const existingOrder = await prisma.order.findUnique({ where: { id } });
    
    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // Create a notification for the customer if one exists
    if (existingOrder && existingOrder.customer_id && existingOrder.status !== status) {
      // Find the customer to get their email
      const customer = await prisma.customer.findUnique({
        where: { id: existingOrder.customer_id }
      });
      
      if (customer && customer.email) {
        // Find the user linked to this email
        const linkedUser = await prisma.user.findUnique({
          where: { email: customer.email }
        });
        
        if (linkedUser) {
          await prisma.notification.create({
            data: {
              user_id: linkedUser.id,
              title: "Order Status Update",
              message: `Your order #${id.slice(0, 8).toUpperCase()} is now ${status}.`,
              type: "ORDER_UPDATE",
              is_read: false,
              organization_id: req.user?.organization_id || (await prisma.organization.findFirst())!.id
            }
          });
        }
      }
    }

    res.status(200).json({ message: 'Order status updated', data: order });
  } catch (error) { next(error); }
};

export const cancel_order = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
    res.status(200).json({ message: 'Order cancelled', data: order });
  } catch (error) { next(error); }
};
