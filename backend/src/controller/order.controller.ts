import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';
import { io } from '../socket';

export const create_order = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let branchId = req.user?.branch_id || req.body.branch_id;
    if (!branchId) {
      const firstBranch = await prisma.branch.findFirst();
      if (!firstBranch) return res.status(400).json({ message: "No branch found to assign order" });
      branchId = firstBranch.id;
    }
    const { table_id, order_type, items } = req.body; // items: [{ menu_item_id, quantity, notes }]
    
    // --- Table Availability Check ---
    if (table_id && (!order_type || order_type === 'DINE_IN')) {
      const table = await prisma.table.findUnique({ where: { id: table_id } });
      // Table is occupied by this session, so we can allow the order.
      // (Removed the block that prevented occupied tables from ordering)

      // Check if there is an upcoming reservation within the next 2 hours
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const upcomingReservation = await prisma.reservation.findFirst({
        where: {
          table_id,
          status: { notIn: ['CANCELLED', 'SEATED'] },
          reservation_time: { gte: now, lte: twoHoursFromNow }
        }
      });

      if (upcomingReservation) {
        return res.status(400).json({ 
          message: `Cannot seat a walk-in. Table is reserved for ${upcomingReservation.customer_name} at ${upcomingReservation.reservation_time.toLocaleTimeString()}.`
        });
      }
    }

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

    if (table_id && (!order_type || order_type === 'DINE_IN')) {
      await prisma.table.update({
        where: { id: table_id },
        data: { status: 'OCCUPIED' }
      });
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

    if (branchId) {
      io.to(`branch_${branchId}`).emit("order_update", { type: "CREATE", order });
      io.to(`branch_${branchId}`).emit("kitchen_update");
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
        },
        bills: {
          include: {
            transactions: true
          }
        },
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
    
    if (!existingOrder) return res.status(404).json({ message: 'Order not found' });

    if (status === 'CLOSED' && existingOrder.status !== 'CLOSED') {
      return res.status(400).json({ message: 'Cannot manually transition to CLOSED without payment. Use Checkout.' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    if (status === 'CLOSED' && order.table_id) {
      await prisma.table.update({
        where: { id: order.table_id },
        data: { status: 'AVAILABLE' }
      });
    }

    if (order.branch_id) {
      io.to(`branch_${order.branch_id}`).emit("order_update", { type: "UPDATE", order });
    }

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
    
    // We should check all items in this order. If they were cooked, log them to WasteLog.
    const orderItems = await prisma.orderItem.findMany({
      where: { order_id: id },
      include: {
        kitchenOrders: true,
        menuItem: true,
        order: true
      }
    });

    const wasteLogs = [];
    for (const item of orderItems) {
      const isCooked = item.kitchenOrders.some(ko => ko.status === 'READY');
      if (isCooked) {
        wasteLogs.push({
          branch_id: item.order.branch_id,
          item_name: item.menuItem.name,
          quantity: item.quantity,
          cost_loss: item.unit_price * item.quantity,
          reason: 'ORDER_CANCELLED'
        });
      }
    }

    if (wasteLogs.length > 0) {
      await prisma.wasteLog.createMany({ data: wasteLogs });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
    
    if (order.table_id) {
      await prisma.table.update({
        where: { id: order.table_id },
        data: { status: 'AVAILABLE' }
      });
    }

    if (order.branch_id) {
      io.to(`branch_${order.branch_id}`).emit("order_update", { type: "CANCEL", order });
    }
    
    res.status(200).json({ message: 'Order cancelled', data: order });
  } catch (error) { next(error); }
};

export const void_order_item = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // OrderItem ID
    const { reason, wasted } = req.body;
    const roleName = req.user?.role_name;

    if (!req.user || !['SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'].includes(roleName || '')) {
      return res.status(403).json({ message: 'Forbidden: Only managers can void items' });
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id },
      include: { order: true }
    });

    if (!orderItem) return res.status(404).json({ message: 'OrderItem not found' });

    // Ensure the order item is not already paid or fully locked
    if (orderItem.order.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Cannot void items on a completed order' });
    }

    // Check if it's already cooked.
    const kitchenOrders = await prisma.kitchenOrder.findMany({ where: { order_item_id: orderItem.id } });
    const isCooked = kitchenOrders.some(ko => ko.status === 'READY');
    
    // Create the void log
    await prisma.voidLog.create({
      data: {
        order_item_id: orderItem.id,
        voided_by_id: req.user.id,
        reason,
        wasted: wasted || false
      }
    });

    // If wasted and cooked, log to WasteLog
    if (wasted && isCooked) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: orderItem.menu_item_id } });
      if (menuItem) {
        await prisma.wasteLog.create({
          data: {
            branch_id: orderItem.order.branch_id,
            item_name: menuItem.name,
            quantity: orderItem.quantity,
            cost_loss: orderItem.unit_price * orderItem.quantity,
            reason: `VOIDED: ${reason}`
          }
        });
      }
    }

    // We can either set the unit_price to 0 or remove it from the subtotal.
    // The most robust way is to mark the OrderItem status as VOIDED if there was a status, 
    // or just set its total_price to 0 and recalculate the order subtotal.
    const updatedItem = await prisma.orderItem.update({
      where: { id },
      data: {
        total_price: 0,
        unit_price: 0,
        notes: `VOIDED: ${reason}`
      }
    });

    // Recalculate order total
    const orderItems = await prisma.orderItem.findMany({
      where: { order_id: orderItem.order_id }
    });
    const newSubtotal = orderItems.reduce((acc, item) => acc + item.total_price, 0);

    await prisma.order.update({
      where: { id: orderItem.order_id },
      data: {
        subtotal: newSubtotal,
        total_amount: newSubtotal // simplified for now
      }
    });

    if (orderItem.order.branch_id) {
      io.to(`branch_${orderItem.order.branch_id}`).emit("order_update", { type: "VOID", orderId: orderItem.order_id });
    }

    res.status(200).json({ message: 'Order item voided securely', data: updatedItem });
  } catch (error) { next(error); }
};
