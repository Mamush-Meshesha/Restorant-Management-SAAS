import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import { create_role, get_roles } from '../controller/role.controller';

const mockUser = { id: 'admin-1', organizationId: 'org-1' };

const mockRole = {
  id: 'role-1',
  organization_id: 'org-1',
  name: 'Manager',
  description: 'Branch Manager',
  permissions: []
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

describe('Role Controller', () => {

  describe('create_role', () => {
    it('creates a new role with permissions', async () => {
      const req = makeReq({
        body: {
          name: 'Manager',
          description: 'Branch Manager',
          permissions: [{ feature_key: 'DASHBOARD', can_read: true }]
        }
      });
      const res = httpMocks.createResponse();

      (prismaMock.role.create as jest.Mock).mockResolvedValue(mockRole);

      await create_role(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.name).toBe('Manager');
      expect(prismaMock.role.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Manager',
            permissions: { create: [{ feature_key: 'DASHBOARD', can_read: true }] }
          })
        })
      );
    });
  });

  describe('get_roles', () => {
    it('returns a list of roles for the organization', async () => {
      const req = makeReq();
      const res = httpMocks.createResponse();

      (prismaMock.role.findMany as jest.Mock).mockResolvedValue([mockRole]);

      await get_roles(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
      expect(prismaMock.role.findMany).toHaveBeenCalledWith({
        where: { organization_id: 'org-1' },
        include: { permissions: true }
      });
    });
  });
});
