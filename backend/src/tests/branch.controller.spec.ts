import { Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import { create_branch, get_branches } from '../controller/branch.controller';

const mockUser = { id: 'user-1', organizationId: 'org-1' };

const mockBranch = {
  id: 'branch-1',
  organization_id: 'org-1',
  name: 'Downtown Branch',
  code: 'DT-01',
  address: '100 Main St',
  phone: '555-0202',
  email: 'downtown@globaleats.com',
  is_active: true,
};

function makeReq(overrides: { body?: any; params?: any; query?: any; user?: any } = {}) {
  const req = httpMocks.createRequest({
    method: 'POST',
    body: overrides.body || {},
    params: overrides.params || {},
    query: overrides.query || {},
  });
  (req as any).user = overrides.user || mockUser;
  return req;
}

describe('Branch Controller', () => {

  describe('create_branch', () => {
    it('returns 400 if organization ID is missing', async () => {
      const req = makeReq({ user: { id: 'user-2' } }); // No org id
      const res = httpMocks.createResponse();

      await create_branch(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toMatch(/Organization ID is required/i);
    });

    it('creates a new branch successfully', async () => {
      const req = makeReq({
        body: {
          name: 'Downtown Branch',
          code: 'DT-01',
          address: '100 Main St',
          phone: '555-0202',
          email: 'downtown@globaleats.com',
        },
      });
      const res = httpMocks.createResponse();

      (prismaMock.branch.create as jest.Mock).mockResolvedValue(mockBranch);

      await create_branch(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.name).toBe('Downtown Branch');
      expect(prismaMock.branch.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organization_id: 'org-1',
            name: 'Downtown Branch',
          }),
        })
      );
    });
  });

  describe('get_branches', () => {
    it('returns 400 if organization ID is missing', async () => {
      const req = makeReq({ user: { id: 'user-2' } });
      const res = httpMocks.createResponse();

      await get_branches(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(400);
    });

    it('returns a list of active branches for the organization', async () => {
      const req = makeReq();
      const res = httpMocks.createResponse();

      (prismaMock.branch.findMany as jest.Mock).mockResolvedValue([mockBranch]);

      await get_branches(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
      expect(prismaMock.branch.findMany).toHaveBeenCalledWith({
        where: { organization_id: 'org-1', is_active: true },
      });
    });
  });
});
