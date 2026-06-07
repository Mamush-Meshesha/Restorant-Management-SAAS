import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import {
  create_reservation,
  get_reservations,
  update_reservation_status
} from '../controller/reservation.controller';

const mockUser = { id: 'user-1', branch_id: 'branch-1' };

const mockReservation = {
  id: 'res-1',
  table_id: 'table-1',
  customer_name: 'John Doe',
  customer_phone: '1234567890',
  reservation_time: new Date('2026-06-10T19:00:00Z'),
  guest_count: 2,
  status: 'PENDING'
};

function makeReq(overrides: { body?: any; params?: any; query?: any; user?: any } = {}) {
  const req = httpMocks.createRequest({
    method: 'POST',
    body: overrides.body || {},
    params: overrides.params || {},
    query: overrides.query || {}
  });
  (req as any).user = overrides.user || mockUser;
  return req;
}

describe('Reservation Controller', () => {

  describe('create_reservation', () => {
    it('creates a new reservation', async () => {
      const req = makeReq({
        body: {
          table_id: 'table-1',
          customer_name: 'John Doe',
          reservation_time: '2026-06-10T19:00:00Z',
          guest_count: 2
        }
      });
      const res = httpMocks.createResponse();

      (prismaMock.reservation.create as jest.Mock).mockResolvedValue(mockReservation);

      await create_reservation(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.customer_name).toBe('John Doe');
      expect(prismaMock.reservation.create).toHaveBeenCalled();
    });
  });

  describe('get_reservations', () => {
    it('returns a list of reservations', async () => {
      const req = makeReq();
      const res = httpMocks.createResponse();

      (prismaMock.reservation.findMany as jest.Mock).mockResolvedValue([mockReservation]);

      await get_reservations(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
      expect(prismaMock.reservation.findMany).toHaveBeenCalled();
    });
  });

  describe('update_reservation_status', () => {
    it('updates reservation status', async () => {
      const req = makeReq({
        params: { id: 'res-1' },
        body: { status: 'CONFIRMED' }
      });
      const res = httpMocks.createResponse();

      (prismaMock.reservation.update as jest.Mock).mockResolvedValue({ ...mockReservation, status: 'CONFIRMED' });

      await update_reservation_status(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data.status).toBe('CONFIRMED');
      expect(prismaMock.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'res-1' },
          data: { status: 'CONFIRMED' }
        })
      );
    });

    it('updates table status to OCCUPIED when reservation is SEATED', async () => {
      const req = makeReq({
        params: { id: 'res-1' },
        body: { status: 'SEATED' }
      });
      const res = httpMocks.createResponse();

      (prismaMock.reservation.update as jest.Mock).mockResolvedValue({ ...mockReservation, status: 'SEATED' });
      (prismaMock.table.update as jest.Mock).mockResolvedValue({});

      await update_reservation_status(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(prismaMock.table.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'table-1' },
          data: { status: 'OCCUPIED' }
        })
      );
    });
  });
});
