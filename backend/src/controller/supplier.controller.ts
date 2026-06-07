import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const create_supplier = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const { name, contact_person, phone, email, address } = req.body;

    const supplier = await prisma.supplier.create({
      data: {
        organization_id: orgId!,
        name,
        contact_person,
        phone,
        email,
        address
      }
    });

    res.status(201).json({ message: "Supplier created", data: supplier });
  } catch (error) { next(error); }
};

export const get_suppliers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const suppliers = await prisma.supplier.findMany({
      where: { organization_id: orgId, is_active: true }
    });

    res.status(200).json({ data: suppliers });
  } catch (error) { next(error); }
};

export const create_purchase_order = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { supplier_id, expected_date, items } = req.body; // items: [{inventory_item_id, quantity, unit_price}]

    const po_number = `PO-${Date.now().toString().slice(-6)}`;
    
    let total_amount = 0;
    const poItemsData = items.map((i: any) => {
      const lineTotal = i.quantity * i.unit_price;
      total_amount += lineTotal;
      return {
        inventory_item_id: i.inventory_item_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: lineTotal
      };
    });

    const po = await prisma.purchaseOrder.create({
      data: {
        supplier_id,
        po_number,
        expected_date: expected_date ? new Date(expected_date) : null,
        total_amount,
        items: {
          create: poItemsData
        }
      },
      include: { items: true }
    });

    res.status(201).json({ message: "Purchase order created", data: po });
  } catch (error) { next(error); }
};
