import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import {
  get_subscription_status,
  get_available_plans,
  upgrade_subscription,
  get_billing_history,
} from '../controller/billing.controller';

// ── Fixtures ─────────────────────────────────────────────────────────────────
const mockOrgId = 'org-1';
const mockUser  = { id: 'u-1', organization_id: mockOrgId };

const mockPlan = {
  id:            'plan-pro',
  name:          'Professional',
  price:         99.99,
  billing_cycle: 'MONTHLY',
  is_active:     true,
  max_branches:  5,
  max_users:     50,
  max_storage_mb: 20000,
};

const mockFreePlan = {
  id:            'plan-free',
  name:          'Free',
  price:         0,
  billing_cycle: 'MONTHLY',
  is_active:     true,
  max_branches:  1,
  max_users:     5,
  max_storage_mb: 1000,
};

const mockSubscription = {
  id:              'sub-1',
  organization_id: mockOrgId,
  plan_id:         'plan-pro',
  status:          'ACTIVE',
  start_date:      new Date(),
  end_date:        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  is_auto_renew:   true,
  plan:            mockPlan,
  usage:           { branches_used: 2, users_used: 10, storage_used_mb: 5000 },
};

function makeReq(overrides: Partial<{ body: any; params: any; user: any }> = {}) {
  const req = httpMocks.createRequest({ method: 'GET', body: overrides.body ?? {}, params: overrides.params ?? {} });
  (req as any).user = overrides.user ?? mockUser;
  return req;
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Billing Controller', () => {

  // ── get_subscription_status ──────────────────────────────────────────────
  describe('GET /billing/subscription', () => {
    it('returns 400 when no organization_id on user', async () => {
      const req = makeReq({ user: {} });
      const res = httpMocks.createResponse();
      await get_subscription_status(req as any, res as any, jest.fn());
      expect(res.statusCode).toBe(400);
    });

    it('returns existing subscription', async () => {
      (prismaMock.subscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      const req = makeReq();
      const res = httpMocks.createResponse();
      await get_subscription_status(req as any, res as any, jest.fn());
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data.id).toBe('sub-1');
    });

    it('auto-provisions free plan when no subscription exists', async () => {
      (prismaMock.subscription.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.subscriptionPlan.findFirst  as jest.Mock).mockResolvedValue(mockFreePlan);
      (prismaMock.subscription.create        as jest.Mock).mockResolvedValue({
        ...mockSubscription,
        plan_id: 'plan-free',
        plan:    mockFreePlan,
      });
      (prismaMock.subscriptionHistory.create as jest.Mock).mockResolvedValue({});

      const req = makeReq();
      const res = httpMocks.createResponse();
      await get_subscription_status(req as any, res as any, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(prismaMock.subscription.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.subscriptionHistory.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── get_available_plans ──────────────────────────────────────────────────
  describe('GET /billing/plans', () => {
    it('returns list of active plans', async () => {
      (prismaMock.subscriptionPlan.findMany as jest.Mock).mockResolvedValue([mockFreePlan, mockPlan]);
      const req = makeReq();
      const res = httpMocks.createResponse();
      await get_available_plans(req as any, res as any, jest.fn());
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(2);
    });

    it('calls next on database error', async () => {
      const dbError = new Error('DB down');
      (prismaMock.subscriptionPlan.findMany as jest.Mock).mockRejectedValue(dbError);
      const req = makeReq();
      const res = httpMocks.createResponse();
      const next = jest.fn();
      await get_available_plans(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(dbError);
    });
  });

  // ── upgrade_subscription ─────────────────────────────────────────────────
  describe('POST /billing/upgrade', () => {
    it('returns 400 when plan_id is missing', async () => {
      const req = makeReq({ body: {} });
      const res = httpMocks.createResponse();
      await upgrade_subscription(req as any, res as any, jest.fn());
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toMatch(/plan_id/i);
    });

    it('returns 404 when plan does not exist', async () => {
      (prismaMock.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue(null);
      const req = makeReq({ body: { plan_id: 'nonexistent', billing_cycle: 'MONTHLY' } });
      const res = httpMocks.createResponse();
      await upgrade_subscription(req as any, res as any, jest.fn());
      expect(res.statusCode).toBe(404);
    });

    it('returns 404 when no active subscription', async () => {
      (prismaMock.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prismaMock.subscription.findUnique     as jest.Mock).mockResolvedValue(null);
      const req = makeReq({ body: { plan_id: 'plan-pro', billing_cycle: 'MONTHLY' } });
      const res = httpMocks.createResponse();
      await upgrade_subscription(req as any, res as any, jest.fn());
      expect(res.statusCode).toBe(404);
    });

    it('returns 200 and creates invoice + payment on successful upgrade', async () => {
      const mockInvoice = { id: 'inv-1', amount: 99.99 };
      (prismaMock.subscriptionPlan.findUnique  as jest.Mock).mockResolvedValue(mockPlan);
      (prismaMock.subscription.findUnique      as jest.Mock).mockResolvedValue(mockSubscription);
      (prismaMock.subscription.update          as jest.Mock).mockResolvedValue(mockSubscription);
      (prismaMock.subscriptionHistory.create   as jest.Mock).mockResolvedValue({});
      (prismaMock.subscriptionInvoice.create   as jest.Mock).mockResolvedValue(mockInvoice);
      (prismaMock.subscriptionPayment.create   as jest.Mock).mockResolvedValue({});

      const req = makeReq({ body: { plan_id: 'plan-pro', billing_cycle: 'MONTHLY' } });
      const res = httpMocks.createResponse();
      await upgrade_subscription(req as any, res as any, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(prismaMock.subscriptionInvoice.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.subscriptionPayment.create).toHaveBeenCalledTimes(1);
      const body = res._getJSONData();
      expect(body.message).toMatch(/updated/i);
    });
  });

  // ── get_billing_history ──────────────────────────────────────────────────
  describe('GET /billing/invoices', () => {
    it('returns empty array when no subscription', async () => {
      (prismaMock.subscription.findUnique as jest.Mock).mockResolvedValue(null);
      const req = makeReq();
      const res = httpMocks.createResponse();
      await get_billing_history(req as any, res as any, jest.fn());
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toEqual([]);
    });

    it('returns invoices for an existing subscription', async () => {
      const mockInvoices = [
        { id: 'inv-1', invoice_number: 'INV-001', amount: 99.99, status: 'PAID', payments: [] },
      ];
      (prismaMock.subscription.findUnique     as jest.Mock).mockResolvedValue(mockSubscription);
      (prismaMock.subscriptionInvoice.findMany as jest.Mock).mockResolvedValue(mockInvoices);
      const req = makeReq();
      const res = httpMocks.createResponse();
      await get_billing_history(req as any, res as any, jest.fn());
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
    });
  });
});
