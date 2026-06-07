import { Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import {
  create_expense,
  get_expenses,
  get_revenue_summary,
  get_daily_revenue,
} from '../controller/analytics.controller';

const mockUser = { id: 'user-1', branch_id: 'branch-1' };

function makeReq(overrides: { body?: any; params?: any; query?: any; user?: any } = {}) {
  const req = httpMocks.createRequest({
    method: 'GET',
    body: overrides.body || {},
    params: overrides.params || {},
    query: overrides.query || {},
  });
  (req as any).user = overrides.user || mockUser;
  return req;
}

describe('Analytics Controller', () => {

  describe('create_expense', () => {
    it('creates an expense', async () => {
      const req = makeReq({
        body: { amount: 100, date: '2026-06-07', reference: 'REF-1' },
      });
      const res = httpMocks.createResponse();

      (prismaMock.expense.create as jest.Mock).mockResolvedValue({ id: 'exp-1', amount: 100 });

      await create_expense(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(prismaMock.expense.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            branch_id: 'branch-1',
            amount: 100,
            reference: 'REF-1',
          }),
        })
      );
    });
  });

  describe('get_expenses', () => {
    it('returns a list of expenses', async () => {
      const req = makeReq();
      const res = httpMocks.createResponse();

      (prismaMock.expense.findMany as jest.Mock).mockResolvedValue([{ id: 'exp-1' }]);

      await get_expenses(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
    });
  });

  describe('get_revenue_summary', () => {
    it('aggregates orders and expenses to return net profit', async () => {
      const req = makeReq();
      const res = httpMocks.createResponse();

      (prismaMock.order.aggregate as jest.Mock).mockResolvedValue({
        _sum: { subtotal: 1000, tax_total: 150, discount_total: 50, total_amount: 1100 },
        _count: { id: 10 },
      });
      (prismaMock.expense.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 300 },
      });

      await get_revenue_summary(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      const data = res._getJSONData().data;
      expect(data.gross_revenue).toBe(1100);
      expect(data.total_expenses).toBe(300);
      expect(data.net_profit).toBe(800); // 1100 - 300
      expect(data.order_count).toBe(10);
    });
  });

  describe('get_daily_revenue', () => {
    it('returns daily revenue reports', async () => {
      const req = makeReq();
      const res = httpMocks.createResponse();

      (prismaMock.revenueReport.findMany as jest.Mock).mockResolvedValue([{ date: new Date(), revenue: 500 }]);

      await get_daily_revenue(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
    });
  });
});
