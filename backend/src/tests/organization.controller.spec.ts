import { Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import {
  get_organization_profile,
  update_organization_profile,
} from '../controller/organization.controller';

const mockUser = { id: 'user-1', organizationId: 'org-1' };

const mockOrg = {
  id: 'org-1',
  name: 'Global Eats',
  address: '123 Food Street',
  phone: '555-0101',
  email: 'contact@globaleats.com',
  website: 'www.globaleats.com',
  tax_id: 'TX-12345',
  branches: [],
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

describe('Organization Controller', () => {

  describe('get_organization_profile', () => {
    it('returns 400 if organization ID is not in token', async () => {
      const req = makeReq({ user: { id: 'user-2' } }); // No org id
      const res = httpMocks.createResponse();

      await get_organization_profile(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toMatch(/Organization ID not found/i);
    });

    it('returns 404 if organization not found', async () => {
      const req = makeReq();
      const res = httpMocks.createResponse();

      (prismaMock.organization.findUnique as jest.Mock).mockResolvedValue(null);

      await get_organization_profile(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(404);
    });

    it('returns organization profile successfully', async () => {
      const req = makeReq();
      const res = httpMocks.createResponse();

      (prismaMock.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);

      await get_organization_profile(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data.name).toBe('Global Eats');
      expect(prismaMock.organization.findUnique).toHaveBeenCalledWith({
        where: { id: 'org-1' },
        include: { branches: true },
      });
    });
  });

  describe('update_organization_profile', () => {
    it('updates and returns organization profile', async () => {
      const req = makeReq({
        body: { name: 'Global Eats Inc.', phone: '555-9999' },
      });
      const res = httpMocks.createResponse();

      (prismaMock.organization.update as jest.Mock).mockResolvedValue({
        ...mockOrg,
        name: 'Global Eats Inc.',
        phone: '555-9999',
      });

      await update_organization_profile(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data.name).toBe('Global Eats Inc.');
      expect(res._getJSONData().data.phone).toBe('555-9999');
      expect(prismaMock.organization.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'org-1' },
          data: expect.objectContaining({
            name: 'Global Eats Inc.',
            phone: '555-9999',
          }),
        })
      );
    });
  });
});
