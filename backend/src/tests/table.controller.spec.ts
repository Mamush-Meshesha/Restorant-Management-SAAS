import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import {
  create_dining_area,
  get_dining_areas,
  update_dining_area,
  delete_dining_area,
  create_table,
  get_tables,
  update_table,
  delete_table
} from '../controller/table.controller';

const mockUser = { id: 'user-1', branch_id: 'branch-1' };

const mockDiningArea = {
  id: 'area-1',
  branch_id: 'branch-1',
  name: 'Patio',
  description: 'Outdoor seating',
  is_active: true
};

const mockTable = {
  id: 'table-1',
  branch_id: 'branch-1',
  dining_area_id: 'area-1',
  name: 'T1',
  capacity: 4,
  status: 'AVAILABLE'
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

describe('Table Controller', () => {

  describe('Dining Areas', () => {
    describe('create_dining_area', () => {
      it('creates a dining area', async () => {
        const req = makeReq({ body: { branch_id: 'branch-1', name: 'Patio' } });
        const res = httpMocks.createResponse();

        (prismaMock.diningArea.create as jest.Mock).mockResolvedValue(mockDiningArea);

        await create_dining_area(req as any, res as unknown as Response, jest.fn());

        expect(res.statusCode).toBe(201);
        expect(prismaMock.diningArea.create).toHaveBeenCalled();
        expect(res._getJSONData().data.name).toBe('Patio');
      });
    });

    describe('get_dining_areas', () => {
      it('returns active dining areas', async () => {
        const req = makeReq({ query: { branchId: 'branch-1' } });
        const res = httpMocks.createResponse();

        (prismaMock.diningArea.findMany as jest.Mock).mockResolvedValue([mockDiningArea]);

        await get_dining_areas(req as any, res as unknown as Response, jest.fn());

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().data).toHaveLength(1);
      });
    });

    describe('update_dining_area', () => {
      it('updates a dining area', async () => {
        const req = makeReq({ params: { id: 'area-1' }, body: { name: 'Main Hall' } });
        const res = httpMocks.createResponse();

        (prismaMock.diningArea.update as jest.Mock).mockResolvedValue({ ...mockDiningArea, name: 'Main Hall' });

        await update_dining_area(req as any, res as unknown as Response, jest.fn());

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().data.name).toBe('Main Hall');
      });
    });

    describe('delete_dining_area', () => {
      it('deletes a dining area', async () => {
        const req = makeReq({ params: { id: 'area-1' } });
        const res = httpMocks.createResponse();

        (prismaMock.diningArea.delete as jest.Mock).mockResolvedValue(mockDiningArea);

        await delete_dining_area(req as any, res as unknown as Response, jest.fn());

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().message).toMatch(/deleted/i);
      });
    });
  });

  describe('Tables', () => {
    describe('create_table', () => {
      it('creates a table', async () => {
        const req = makeReq({ body: { branch_id: 'branch-1', dining_area_id: 'area-1', name: 'T1', capacity: 4 } });
        const res = httpMocks.createResponse();

        (prismaMock.table.create as jest.Mock).mockResolvedValue(mockTable);

        await create_table(req as any, res as unknown as Response, jest.fn());

        expect(res.statusCode).toBe(201);
        expect(res._getJSONData().data.name).toBe('T1');
      });
    });

    describe('get_tables', () => {
      it('returns tables and maps name to table_number', async () => {
        const req = makeReq({ query: { branchId: 'branch-1' } });
        const res = httpMocks.createResponse();

        (prismaMock.table.findMany as jest.Mock).mockResolvedValue([mockTable]);

        await get_tables(req as any, res as unknown as Response, jest.fn());

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().data).toHaveLength(1);
        expect(res._getJSONData().data[0].table_number).toBe('T1');
      });
    });

    describe('update_table', () => {
      it('updates a table', async () => {
        const req = makeReq({ params: { id: 'table-1' }, body: { name: 'T2' } });
        const res = httpMocks.createResponse();

        (prismaMock.table.update as jest.Mock).mockResolvedValue({ ...mockTable, name: 'T2' });

        await update_table(req as any, res as unknown as Response, jest.fn());

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().data.name).toBe('T2');
      });
    });

    describe('delete_table', () => {
      it('deletes a table', async () => {
        const req = makeReq({ params: { id: 'table-1' } });
        const res = httpMocks.createResponse();

        (prismaMock.table.delete as jest.Mock).mockResolvedValue(mockTable);

        await delete_table(req as any, res as unknown as Response, jest.fn());

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().message).toMatch(/deleted/i);
      });
    });
  });
});
