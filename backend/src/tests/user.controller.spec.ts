import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

jest.mock('../lib/password', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password')
}));

import { create_user, get_users } from '../controller/user.controller';

const mockUser = { id: 'admin-1', organizationId: 'org-1' };

const mockNewUser = {
  id: 'user-2',
  organization_id: 'org-1',
  branch_id: 'branch-1',
  role_id: 'role-1',
  username: 'testuser',
  email: 'test@example.com',
  password_hash: 'hashed_password',
  first_name: 'Test',
  last_name: 'User'
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

describe('User Controller', () => {

  describe('create_user', () => {
    it('creates a new user with a hashed password', async () => {
      const req = makeReq({
        body: {
          branch_id: 'branch-1',
          role_id: 'role-1',
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          first_name: 'Test',
          last_name: 'User'
        }
      });
      const res = httpMocks.createResponse();

      (prismaMock.user.create as jest.Mock).mockResolvedValue(mockNewUser);

      await create_user(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.username).toBe('testuser');
      expect(res._getJSONData().data.password_hash).toBeUndefined(); // Should not send back full object
      expect(prismaMock.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ password_hash: 'hashed_password' })
        })
      );
    });
  });

  describe('get_users', () => {
    it('returns a list of users without password hashes', async () => {
      const req = makeReq();
      const res = httpMocks.createResponse();

      (prismaMock.user.findMany as jest.Mock).mockResolvedValue([mockNewUser]);

      await get_users(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
      expect(res._getJSONData().data[0].password_hash).toBeUndefined();
      expect(res._getJSONData().data[0].username).toBe('testuser');
    });
  });
});
