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

describe('Phase 5: Offline Resiliency Architecture E2E Tests', () => {
  const adminToken = jwt.sign(
    { id: 'admin-1', role_name: 'BRANCH_MANAGER', email: 'admin@example.com', organizationId: 'org-1', organization_id: 'org-1', branch_id: 'branch-1' },
    process.env.JWT_SECRET || 'fallback-secret-change-me'
  );

  beforeEach(() => {
    jest.clearAllMocks();

    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      is_active: true,
      role: { name: 'BRANCH_MANAGER' },
      organization_id: 'org-1',
      branch_id: 'branch-1'
    });
  });

  describe('Offline Batch Synchronization', () => {
    it('should successfully sync an offline batch of orders and transactions atomically', async () => {
      // Mock the transaction function to just execute the callback
      (prismaMock.$transaction as jest.Mock).mockImplementation(async (callback) => {
        // The callback expects a PrismaClient instance, we pass prismaMock
        return callback(prismaMock);
      });

      (prismaMock.order.upsert as jest.Mock).mockResolvedValue({ id: 'offline-order-1' });
      (prismaMock.orderItem.upsert as jest.Mock).mockResolvedValue({ id: 'offline-item-1' });
      (prismaMock.kitchenOrder.upsert as jest.Mock).mockResolvedValue({ id: 'ko-offline-item-1' });
      (prismaMock.transaction.upsert as jest.Mock).mockResolvedValue({ id: 'offline-tx-1' });

      const offlinePayload = {
        branch_id: 'branch-1',
        orders: [
          {
            id: 'offline-order-1',
            order_type: 'DINE_IN',
            subtotal: 50,
            items: [
              { id: 'offline-item-1', menu_item_id: 'burger-id', quantity: 2, total_price: 50 }
            ]
          }
        ],
        transactions: [
          {
            id: 'offline-tx-1',
            amount: 50,
            payment_method: 'CASH',
            type: 'PAYMENT'
          }
        ]
      };

      const res = await request(app)
        .post('/api/v1/sync/batch')
        .set('Cookie', [`token=${adminToken}`])
        .send(offlinePayload);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Batch synced successfully");
      expect(res.body.data.syncedOrders).toBe(1);
      expect(res.body.data.syncedTransactions).toBe(1);

      // Verify the idempotency upserts were called correctly
      expect(prismaMock.order.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'offline-order-1' },
          create: expect.objectContaining({ branch_id: 'branch-1', subtotal: 50 })
        })
      );

      expect(prismaMock.orderItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'offline-item-1' },
          create: expect.objectContaining({ order_id: 'offline-order-1', quantity: 2 })
        })
      );

      expect(prismaMock.transaction.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'offline-tx-1' },
          create: expect.objectContaining({ organization_id: 'org-1', amount: 50 })
        })
      );
    });

    it('should rollback and return 500 if an atomic sync failure occurs (e.g. database disconnect during sync)', async () => {
      // Simulate a database failure during transaction execution
      (prismaMock.$transaction as jest.Mock).mockRejectedValue(new Error("Database Timeout Error"));

      const offlinePayload = {
        branch_id: 'branch-1',
        orders: [{ id: 'offline-order-2', order_type: 'TAKEAWAY', items: [] }],
        transactions: []
      };

      const res = await request(app)
        .post('/api/v1/sync/batch')
        .set('Cookie', [`token=${adminToken}`])
        .send(offlinePayload);

      expect(res.status).toBe(500);
    });
  });
});
