import { Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import {
  create_supplier,
  get_suppliers,
  create_purchase_order,
} from '../controller/supplier.controller';

const mockUser = { id: 'user-1', organizationId: 'org-1' };

const mockSupplier = {
  id: 'sup-1',
  organization_id: 'org-1',
  name: 'Fresh Farms',
  contact_person: 'Jane Smith',
  phone: '555-1234',
  email: 'supply@freshfarms.com',
  is_active: true,
};

const mockPO = {
  id: 'po-1',
  supplier_id: 'sup-1',
  po_number: 'PO-123456',
  total_amount: 50,
  items: [{ inventory_item_id: 'inv-1', quantity: 10, unit_price: 5, total_price: 50 }],
};

function makeReq(overrides: { body?: any; params?: any; query?: any; user?: any } = {}) {
  const req = httpMocks.createRequest({
    method: 'POST',
    body: overrides.body || {},
    params: overrides.params || {},
    query: overrides.query || {},
  });
  (req as any).user = overrides.user || mockUser;
  return req;
}

describe('Supplier Controller', () => {

  describe('create_supplier', () => {
    it('creates a new supplier', async () => {
      const req = makeReq({
        body: {
          name: 'Fresh Farms',
          contact_person: 'Jane Smith',
          phone: '555-1234',
          email: 'supply@freshfarms.com',
        },
      });
      const res = httpMocks.createResponse();

      (prismaMock.supplier.create as jest.Mock).mockResolvedValue(mockSupplier);

      await create_supplier(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.name).toBe('Fresh Farms');
      expect(prismaMock.supplier.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organization_id: 'org-1',
            name: 'Fresh Farms',
          }),
        })
      );
    });
  });

  describe('get_suppliers', () => {
    it('returns active suppliers for the organization', async () => {
      const req = makeReq();
      const res = httpMocks.createResponse();

      (prismaMock.supplier.findMany as jest.Mock).mockResolvedValue([mockSupplier]);

      await get_suppliers(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
      expect(prismaMock.supplier.findMany).toHaveBeenCalledWith({
        where: { organization_id: 'org-1', is_active: true },
      });
    });
  });

  describe('create_purchase_order', () => {
    it('calculates totals and creates a PO with a unique PO number', async () => {
      const req = makeReq({
        body: {
          supplier_id: 'sup-1',
          expected_date: '2026-06-15',
          items: [{ inventory_item_id: 'inv-1', quantity: 10, unit_price: 5 }],
        },
      });
      const res = httpMocks.createResponse();

      (prismaMock.purchaseOrder.create as jest.Mock).mockResolvedValue(mockPO);

      await create_purchase_order(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.items).toHaveLength(1);
      expect(prismaMock.purchaseOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            supplier_id: 'sup-1',
            total_amount: 50,
            po_number: expect.stringMatching(/^PO-/),
          }),
        })
      );
    });
  });
});
