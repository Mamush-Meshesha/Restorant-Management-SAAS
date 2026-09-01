import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import router from '../api/index';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cookieParser());
router(app);
jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';
jest.mock('../lib/auditTrail', () => ({ createAuditLog: jest.fn() }));

describe('POS Accountability & Fraud Prevention E2E Tests', () => {
  const adminToken = jwt.sign(
    { id: 'admin-1', role_name: 'BRANCH_MANAGER', organizationId: 'org-1', branch_id: 'branch-1' },
    process.env.JWT_SECRET || 'fallback-secret-change-me'
  );

  beforeEach(() => {
    jest.clearAllMocks();

    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'admin-1',
      is_active: true,
      role: { name: 'BRANCH_MANAGER' },
      organization_id: 'org-1',
      branch_id: 'branch-1'
    });

    (prismaMock.permission.findFirst as jest.Mock).mockResolvedValue({
      id: 'perm-1',
      feature_key: 'CASH_DRAWER',
      can_create: true
    });
  });

  describe('Cash Drawer (Register) Operations', () => {
    it('should open a register with a starting float', async () => {
      (prismaMock.cashDrawerSession.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaMock.cashDrawerSession.create as jest.Mock).mockResolvedValue({
        id: 'session-1',
        status: 'OPEN',
        starting_float: 200
      });

      const res = await request(app)
        .post('/api/v1/register/open')
        .set('Cookie', [`token=${adminToken}`])
        .send({ branch_id: 'branch-1', starting_float: 200 });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('OPEN');
      expect(prismaMock.cashDrawerSession.create).toHaveBeenCalled();
    });

    it('should block opening a register if one is already open', async () => {
      (prismaMock.cashDrawerSession.findFirst as jest.Mock).mockResolvedValue({
        id: 'session-1',
        status: 'OPEN'
      });

      const res = await request(app)
        .post('/api/v1/register/open')
        .set('Cookie', [`token=${adminToken}`])
        .send({ branch_id: 'branch-1', starting_float: 200 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already have an open/i);
    });

    it('should close a register and calculate variance', async () => {
      (prismaMock.cashDrawerSession.findUnique as jest.Mock).mockResolvedValue({
        id: 'session-1',
        status: 'OPEN',
        starting_float: 200,
        opened_by_id: 'admin-1'
      });

      // Mock aggregate to simulate 150 cash transactions
      (prismaMock.transaction.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 150, tip_amount: 10 }
      });

      (prismaMock.cashDrawerSession.update as jest.Mock).mockResolvedValue({
        id: 'session-1',
        status: 'CLOSED',
        expected_cash: 360,
        actual_cash: 350,
        variance: -10
      });

      const res = await request(app)
        .post('/api/v1/register/close')
        .set('Cookie', [`token=${adminToken}`])
        .send({ session_id: 'session-1', actual_cash: 350, notes: 'Short by 10' });

      expect(res.status).toBe(200);
      expect(prismaMock.transaction.aggregate).toHaveBeenCalled();
      expect(prismaMock.cashDrawerSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'CLOSED',
            expected_cash: 360, // 200 + 150 + 10
            actual_cash: 350,
            variance: -10
          })
        })
      );
    });
  });

  describe('Order Voids (Fraud Prevention)', () => {
    it('should securely void an order item and log it', async () => {
      (prismaMock.orderItem.findUnique as jest.Mock).mockResolvedValue({
        id: 'item-1',
        order_id: 'order-1',
        total_price: 25,
        order: { status: 'PENDING' }
      });

      (prismaMock.voidLog.create as jest.Mock).mockResolvedValue({ id: 'void-1' });
      (prismaMock.orderItem.update as jest.Mock).mockResolvedValue({
        id: 'item-1',
        total_price: 0
      });
      (prismaMock.orderItem.findMany as jest.Mock).mockResolvedValue([
        { total_price: 0 }, { total_price: 15 } // Mock remaining items
      ]);
      (prismaMock.order.update as jest.Mock).mockResolvedValue({ id: 'order-1', subtotal: 15 });

      const res = await request(app)
        .put('/api/v1/order/item/item-1/void')
        .set('Cookie', [`token=${adminToken}`])
        .send({ reason: 'Customer complained', wasted: true });

      expect(res.status).toBe(200);
      expect(prismaMock.voidLog.create).toHaveBeenCalled();
      expect(prismaMock.order.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ subtotal: 15 }) })
      );
    });

    it('should block voiding if the order is COMPLETED', async () => {
      (prismaMock.orderItem.findUnique as jest.Mock).mockResolvedValue({
        id: 'item-1',
        order: { status: 'COMPLETED' }
      });

      const res = await request(app)
        .put('/api/v1/order/item/item-1/void')
        .set('Cookie', [`token=${adminToken}`])
        .send({ reason: 'Try to steal money' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Cannot void items on a completed order/i);
    });
  });
});
