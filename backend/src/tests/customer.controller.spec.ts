import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import { create_customer, get_customers } from '../controller/customer.controller';

const mockUser = { id: 'admin-1', organizationId: 'org-1' };

const mockCustomer = {
  id: 'cust-1',
  organization_id: 'org-1',
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com'
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

describe('Customer Controller', () => {

  describe('create_customer', () => {
    it('creates a new customer and parses name', async () => {
      const req = makeReq({
        body: {
          name: 'Jane Doe',
          email: 'jane@example.com'
        }
      });
      const res = httpMocks.createResponse();

      (prismaMock.customer.create as jest.Mock).mockResolvedValue(mockCustomer);

      await create_customer(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(prismaMock.customer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            first_name: 'Jane',
            last_name: 'Doe'
          })
        })
      );
    });
  });

  describe('get_customers', () => {
    it('returns a list of formatted customers', async () => {
      const req = makeReq();
      const res = httpMocks.createResponse();

      (prismaMock.customer.findMany as jest.Mock).mockResolvedValue([mockCustomer]);

      await get_customers(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
      expect(res._getJSONData().data[0].name).toBe('Jane Doe');
      expect(prismaMock.customer.findMany).toHaveBeenCalled();
    });
  });
});
