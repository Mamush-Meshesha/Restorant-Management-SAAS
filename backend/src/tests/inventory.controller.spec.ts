import { Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import {
  get_inventory,
  add_inventory_item,
  adjust_stock,
  log_waste,
} from '../controller/inventory.controller';

const mockUser = { id: 'user-1', branch_id: 'branch-1' };

const mockItem = {
  id: 'inv-1',
  branch_id: 'branch-1',
  name: 'Tomato Sauce',
  sku: 'TS-001',
  category: 'Sauces',
  unit: 'litre',
  current_stock: 10,
  minimum_stock: 2,
  cost_per_unit: 1.5,
  is_active: true,
};

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

describe('Inventory Controller', () => {

  describe('get_inventory', () => {
    it('returns active inventory items for the branch', async () => {
      const req = makeReq();
      const res = httpMocks.createResponse();

      (prismaMock.inventoryItem.findMany as jest.Mock).mockResolvedValue([mockItem]);

      await get_inventory(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
      expect(prismaMock.inventoryItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { branch_id: 'branch-1', is_active: true },
        })
      );
    });
  });

  describe('add_inventory_item', () => {
    it('creates a new inventory item', async () => {
      const req = makeReq({
        body: {
          name: 'Tomato Sauce',
          sku: 'TS-001',
          category: 'Sauces',
          unit: 'litre',
          minimum_stock: 2,
          cost_per_unit: 1.5,
        },
      });
      const res = httpMocks.createResponse();

      (prismaMock.inventoryItem.create as jest.Mock).mockResolvedValue(mockItem);

      await add_inventory_item(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.name).toBe('Tomato Sauce');
      expect(prismaMock.inventoryItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ branch_id: 'branch-1', name: 'Tomato Sauce' }),
        })
      );
    });
  });

  describe('adjust_stock', () => {
    it('creates a stock adjustment and updates the item stock', async () => {
      const req = makeReq({
        body: { item_id: 'inv-1', quantity_changed: 5, reason: 'Delivery received' },
      });
      const res = httpMocks.createResponse();

      const mockAdjustment = { id: 'adj-1', item_id: 'inv-1', quantity_changed: 5 };
      const updatedItem = { ...mockItem, current_stock: 15 };

      (prismaMock.stockAdjustment.create as jest.Mock).mockResolvedValue(mockAdjustment);
      (prismaMock.inventoryItem.update as jest.Mock).mockResolvedValue(updatedItem);

      await adjust_stock(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data.item.current_stock).toBe(15);
      expect(prismaMock.stockAdjustment.create).toHaveBeenCalled();
      expect(prismaMock.inventoryItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: { current_stock: { increment: 5 } },
        })
      );
    });
  });

  describe('log_waste', () => {
    it('creates a waste log entry', async () => {
      const req = makeReq({
        body: { item_name: 'Bread', quantity: 3, cost_loss: 2.5, reason: 'Expired' },
      });
      const res = httpMocks.createResponse();

      const mockWaste = { id: 'waste-1', item_name: 'Bread', quantity: 3 };
      (prismaMock.wasteLog.create as jest.Mock).mockResolvedValue(mockWaste);

      await log_waste(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.item_name).toBe('Bread');
      expect(prismaMock.wasteLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ branch_id: 'branch-1', item_name: 'Bread' }),
        })
      );
    });
  });
});
