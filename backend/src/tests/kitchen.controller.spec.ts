import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import {
  get_kitchen_orders,
  update_kitchen_order_status,
  create_kitchen_station,
  get_kitchen_stations,
  update_kitchen_station,
  delete_kitchen_station
} from '../controller/kitchen.controller';

const mockUser = { id: 'user-1', branch_id: 'branch-1' };

const mockKitchenOrder = {
  id: 'ko-1',
  station_id: 'station-1',
  order_item_id: 'oi-1',
  status: 'PENDING',
  started_at: null,
  completed_at: null
};

const mockStation = {
  id: 'station-1',
  branch_id: 'branch-1',
  name: 'Main Kitchen',
  is_active: true
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

describe('Kitchen Controller', () => {

  describe('get_kitchen_orders', () => {
    it('returns pending and preparing kitchen orders', async () => {
      const req = makeReq({ query: { branchId: 'branch-1' } });
      const res = httpMocks.createResponse();

      (prismaMock.kitchenOrder.findMany as jest.Mock).mockResolvedValue([mockKitchenOrder]);

      await get_kitchen_orders(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
      expect(prismaMock.kitchenOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: { in: ['PENDING', 'PREPARING'] } })
        })
      );
    });
  });

  describe('update_kitchen_order_status', () => {
    it('updates status to PREPARING and sets started_at', async () => {
      const req = makeReq({
        params: { id: 'ko-1' },
        body: { status: 'PREPARING' }
      });
      const res = httpMocks.createResponse();

      const updatedKitchenOrder = { ...mockKitchenOrder, status: 'PREPARING', started_at: new Date() };
      (prismaMock.kitchenOrder.update as jest.Mock).mockResolvedValue(updatedKitchenOrder);
      (prismaMock.orderItem.update as jest.Mock).mockResolvedValue({});

      await update_kitchen_order_status(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data.status).toBe('PREPARING');
      expect(prismaMock.kitchenOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ko-1' },
          data: expect.objectContaining({ status: 'PREPARING', started_at: expect.any(Date) })
        })
      );
      expect(prismaMock.orderItem.update).toHaveBeenCalled();
    });

    it('updates status to READY and sets completed_at', async () => {
      const req = makeReq({
        params: { id: 'ko-1' },
        body: { status: 'READY' }
      });
      const res = httpMocks.createResponse();

      const updatedKitchenOrder = { ...mockKitchenOrder, status: 'READY', completed_at: new Date() };
      (prismaMock.kitchenOrder.update as jest.Mock).mockResolvedValue(updatedKitchenOrder);
      (prismaMock.orderItem.update as jest.Mock).mockResolvedValue({});

      await update_kitchen_order_status(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(prismaMock.kitchenOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ko-1' },
          data: expect.objectContaining({ status: 'READY', completed_at: expect.any(Date) })
        })
      );
    });
  });

  describe('create_kitchen_station', () => {
    it('creates a new kitchen station', async () => {
      const req = makeReq({
        body: { branch_id: 'branch-1', name: 'Grill Station' }
      });
      const res = httpMocks.createResponse();

      (prismaMock.kitchenStation.create as jest.Mock).mockResolvedValue({ ...mockStation, name: 'Grill Station' });

      await create_kitchen_station(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.name).toBe('Grill Station');
      expect(prismaMock.kitchenStation.create).toHaveBeenCalled();
    });
  });

  describe('get_kitchen_stations', () => {
    it('returns a list of stations', async () => {
      const req = makeReq({ query: { branchId: 'branch-1' } });
      const res = httpMocks.createResponse();

      (prismaMock.kitchenStation.findMany as jest.Mock).mockResolvedValue([mockStation]);

      await get_kitchen_stations(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
    });
  });

  describe('update_kitchen_station', () => {
    it('updates a kitchen station', async () => {
      const req = makeReq({
        params: { id: 'station-1' },
        body: { name: 'New Name', is_active: false }
      });
      const res = httpMocks.createResponse();

      (prismaMock.kitchenStation.update as jest.Mock).mockResolvedValue({ ...mockStation, name: 'New Name', is_active: false });

      await update_kitchen_station(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data.name).toBe('New Name');
      expect(res._getJSONData().data.is_active).toBe(false);
    });
  });

  describe('delete_kitchen_station', () => {
    it('deletes a kitchen station', async () => {
      const req = makeReq({ params: { id: 'station-1' } });
      const res = httpMocks.createResponse();

      (prismaMock.kitchenStation.delete as jest.Mock).mockResolvedValue(mockStation);

      await delete_kitchen_station(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().message).toMatch(/deleted/i);
    });
  });
});
