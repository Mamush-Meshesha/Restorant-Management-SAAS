import { Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import { generate_bill, checkout_bill } from '../controller/bill.controller';

const mockUser = { id: 'user-1', organizationId: 'org-1' };

const mockOrder = {
  id: 'order-1',
  subtotal: 100,
  discount_total: 10,
  status: 'DELIVERED',
};

const mockBill = {
  id: 'bill-1',
  order_id: 'order-1',
  bill_number: 'INV-123456',
  subtotal: 100,
  tax_amount: 15,
  discount_amount: 10,
  total_amount: 105,
  status: 'UNPAID',
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

describe('Bill Controller', () => {

  describe('generate_bill', () => {
    it('returns 404 if order is not found', async () => {
      const req = makeReq({ body: { order_id: 'invalid-order' } });
      const res = httpMocks.createResponse();

      (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(null);

      await generate_bill(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData().message).toMatch(/Order not found/i);
    });

    it('calculates tax/total and creates a bill', async () => {
      const req = makeReq({ body: { order_id: 'order-1' } });
      const res = httpMocks.createResponse();

      (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (prismaMock.bill.create as jest.Mock).mockResolvedValue(mockBill);

      await generate_bill(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.total_amount).toBe(105);
      expect(prismaMock.bill.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            order_id: 'order-1',
            subtotal: 100,
            tax_amount: 15, // 15% of 100
            total_amount: 105, // 100 + 15 - 10
            status: 'UNPAID',
          }),
        })
      );
    });
  });

  describe('checkout_bill', () => {
    it('creates a transaction and updates bill/order statuses', async () => {
      const req = makeReq({
        body: { bill_id: 'bill-1', payment_method: 'CREDIT_CARD', amount: 105 },
      });
      const res = httpMocks.createResponse();

      const mockTransaction = { id: 'trans-1', bill_id: 'bill-1', amount: 105 };

      (prismaMock.transaction.create as jest.Mock).mockResolvedValue(mockTransaction);
      (prismaMock.bill.update as jest.Mock).mockResolvedValue({ ...mockBill, status: 'PAID' });
      (prismaMock.order.update as jest.Mock).mockResolvedValue({ ...mockOrder, status: 'CLOSED' });

      await checkout_bill(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(prismaMock.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { bill_id: 'bill-1', payment_method: 'CREDIT_CARD', amount: 105 },
        })
      );
      expect(prismaMock.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'bill-1' },
          data: { status: 'PAID' },
        })
      );
      expect(prismaMock.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1' }, // because bill.order_id was mocked as order-1
          data: { status: 'CLOSED' },
        })
      );
    });
  });
});
