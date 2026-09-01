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

jest.mock('../socket', () => ({
  io: {
    to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    emit: jest.fn()
  }
}));

describe('Phase 4: Waitlist & Reservation Deposits E2E Tests', () => {
  const customerToken = jwt.sign(
    { id: 'customer-1', role_name: 'CUSTOMER', email: 'test@example.com', organizationId: 'org-1', organization_id: 'org-1' },
    process.env.JWT_SECRET || 'fallback-secret-change-me'
  );

  beforeEach(() => {
    jest.clearAllMocks();
    
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'customer-1',
      email: 'test@example.com',
      is_active: true,
      role: { name: 'CUSTOMER' },
      organization_id: 'org-1'
    });
  });

  describe('Reservation Deposits', () => {
    it('should create a reservation requiring a deposit with status PENDING_PAYMENT', async () => {
      (prismaMock.customer.findFirst as jest.Mock).mockResolvedValue({ id: 'cust-1' });
      (prismaMock.reservation.create as jest.Mock).mockResolvedValue({
        id: 'res-1',
        deposit_amount: 50,
        status: 'PENDING_PAYMENT'
      });

      const res = await request(app)
        .post('/api/v1/reservation')
        .set('Cookie', [`token=${customerToken}`])
        .send({
          table_id: 'table-1',
          customer_name: 'John Doe',
          customer_phone: '1234567890',
          reservation_time: new Date().toISOString(),
          guest_count: 4,
          deposit_amount: 50
        });

      expect(res.status).toBe(201);
      expect(prismaMock.reservation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deposit_amount: 50,
            status: 'PENDING_PAYMENT'
          })
        })
      );
    });

    it('should pay a reservation deposit and update status to CONFIRMED', async () => {
      (prismaMock.reservation.findUnique as jest.Mock).mockResolvedValue({
        id: 'res-1',
        payment_status: 'PENDING',
        deposit_amount: 50
      });

      (prismaMock.reservation.update as jest.Mock).mockResolvedValue({
        id: 'res-1',
        payment_status: 'PAID',
        status: 'CONFIRMED'
      });

      const res = await request(app)
        .post('/api/v1/reservation/res-1/pay-deposit')
        .set('Cookie', [`token=${customerToken}`])
        .send({ payment_method: 'tok_visa' });

      expect(res.status).toBe(200);
      expect(prismaMock.reservation.update).toHaveBeenCalledWith({
        where: { id: 'res-1' },
        data: {
          payment_status: 'PAID',
          status: 'CONFIRMED'
        }
      });
    });

    it('should reject payment if already PAID', async () => {
      (prismaMock.reservation.findUnique as jest.Mock).mockResolvedValue({
        id: 'res-1',
        payment_status: 'PAID'
      });

      const res = await request(app)
        .post('/api/v1/reservation/res-1/pay-deposit')
        .set('Cookie', [`token=${customerToken}`])
        .send({ payment_method: 'tok_visa' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Deposit is already paid");
    });
  });

  describe('Waitlist Deposits', () => {
    it('should allow joining a waitlist with a deposit', async () => {
      (prismaMock.waitlist.count as jest.Mock).mockResolvedValue(0);
      (prismaMock.waitlist.create as jest.Mock).mockResolvedValue({
        id: 'wait-1',
        status: 'WAITING_PAYMENT',
        deposit_amount: 20
      });

      const res = await request(app)
        .post('/api/v1/waitlist/join')
        .send({
          branch_id: 'branch-1',
          customer_name: 'Jane Doe',
          customer_phone: '0987654321',
          guest_count: 2,
          deposit_amount: 20
        });

      expect(res.status).toBe(201);
      expect(prismaMock.waitlist.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'WAITING_PAYMENT',
            deposit_amount: 20
          })
        })
      );
    });

    it('should confirm a waitlist spot once deposit is paid', async () => {
      (prismaMock.waitlist.findUnique as jest.Mock).mockResolvedValue({
        id: 'wait-1',
        payment_status: 'PENDING'
      });

      (prismaMock.waitlist.update as jest.Mock).mockResolvedValue({
        id: 'wait-1',
        payment_status: 'PAID',
        status: 'WAITING'
      });

      const res = await request(app)
        .post('/api/v1/waitlist/wait-1/pay-deposit')
        .send({ payment_method: 'tok_visa' });

      expect(res.status).toBe(200);
      expect(prismaMock.waitlist.update).toHaveBeenCalledWith({
        where: { id: 'wait-1' },
        data: {
          payment_status: 'PAID',
          status: 'WAITING'
        }
      });
    });
  });
});
