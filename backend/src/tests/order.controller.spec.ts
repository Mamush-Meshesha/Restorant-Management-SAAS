import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import {
  create_order,
  get_orders,
  update_order_status
} from '../controller/order.controller';

const mockUser = {
  id: 'user-1',
  branch_id: 'branch-1',
  organization_id: 'org-1'
};

const mockOrder = {
  id: 'order-1',
  branch_id: 'branch-1',
  table_id: 'table-1',
  order_type: 'DINE_IN',
  status: 'PENDING',
  subtotal: 10,
  total_amount: 10,
  items: [
    { id: 'item-1', menu_item_id: 'menu-1', quantity: 1, unit_price: 10, total_price: 10 }
  ]
};

const mockMenuItem = {
  id: 'menu-1',
  base_price: 10
};

const mockStation = {
  id: 'station-1',
  branch_id: 'branch-1'
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

describe('Order Controller', () => {

  describe('create_order', () => {
    it('should return 400 if no branch is found', async () => {
      const req = makeReq({ user: { id: 'user-1' } }); // No branch_id
      (prismaMock.branch.findFirst as jest.Mock).mockResolvedValue(null);
      const res = httpMocks.createResponse();
      
      await create_order(req as any, res as unknown as Response, jest.fn());
      
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toMatch(/No branch/i);
    });

    it('should create an order and kitchen tickets', async () => {
      const req = makeReq({
        body: {
          table_id: 'table-1',
          items: [{ menu_item_id: 'menu-1', quantity: 1, notes: 'No onions' }]
        }
      });
      const res = httpMocks.createResponse();

      (prismaMock.menuItem.findUnique as jest.Mock).mockResolvedValue(mockMenuItem);
      (prismaMock.order.create as jest.Mock).mockResolvedValue(mockOrder);
      (prismaMock.kitchenStation.findFirst as jest.Mock).mockResolvedValue(mockStation);
      (prismaMock.kitchenOrder.createMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prismaMock.user.findMany as jest.Mock).mockResolvedValue([{ id: 'staff-1', branch_id: 'branch-1' }]);
      (prismaMock.organization.findFirst as jest.Mock).mockResolvedValue({ id: 'org-1' });
      (prismaMock.notification.createMany as jest.Mock).mockResolvedValue({ count: 1 });

      await create_order(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.id).toBe('order-1');
      expect(prismaMock.order.create).toHaveBeenCalled();
      expect(prismaMock.kitchenOrder.createMany).toHaveBeenCalled();
    });

    it('should fallback to creating a default kitchen station if none exists', async () => {
      const req = makeReq({
        body: {
          table_id: 'table-1',
          items: [{ menu_item_id: 'menu-1', quantity: 1, notes: '' }]
        }
      });
      const res = httpMocks.createResponse();

      (prismaMock.menuItem.findUnique as jest.Mock).mockResolvedValue(mockMenuItem);
      (prismaMock.order.create as jest.Mock).mockResolvedValue(mockOrder);
      (prismaMock.kitchenStation.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaMock.kitchenStation.create as jest.Mock).mockResolvedValue(mockStation);
      (prismaMock.user.findMany as jest.Mock).mockResolvedValue([]);

      await create_order(req as any, res as unknown as Response, jest.fn());

      expect(prismaMock.kitchenStation.create).toHaveBeenCalled();
      expect(prismaMock.kitchenOrder.createMany).toHaveBeenCalled();
      expect(res.statusCode).toBe(201);
    });
  });

  describe('get_orders', () => {
    it('should return a list of orders', async () => {
      const req = makeReq({ query: { limit: '10' } });
      const res = httpMocks.createResponse();

      (prismaMock.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);

      await get_orders(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { branch_id: 'branch-1' },
          take: 10
        })
      );
    });
  });

  describe('update_order_status', () => {
    it('should update the order status', async () => {
      const req = makeReq({
        params: { id: 'order-1' },
        body: { status: 'COMPLETED' }
      });
      const res = httpMocks.createResponse();

      const updatedOrder = { ...mockOrder, status: 'COMPLETED' };
      (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (prismaMock.order.update as jest.Mock).mockResolvedValue(updatedOrder);
      (prismaMock.notification.create as jest.Mock).mockResolvedValue({});

      await update_order_status(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data.status).toBe('COMPLETED');
      expect(prismaMock.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1' },
          data: { status: 'COMPLETED' }
        })
      );
    });
  });
});
