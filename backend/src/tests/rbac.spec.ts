import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';
import { requireRole, AuthenticatedRequest } from '../middleware/institute.middleware';
import userRoutes from '../api/routes/user.routes';
import branchRoutes from '../api/routes/branch.routes';
import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
jest.mock('../lib/jwt', () => ({
  verifyToken: jest.fn().mockReturnValue({ id: 'test-id' }),
}));

import prismaMock from './__mocks__/prisma.mock';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);

describe('RBAC Route Protection', () => {

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('User Visibility Hierarchy', () => {
    it('SUPERADMIN fetches all users across organizations without restrictions', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'test-id', is_active: true, role: { name: 'SUPERADMIN' }, role_id: 'r1', organization_id: 'org1' } as any);
      prismaMock.user.findMany.mockResolvedValue([]);
      
      await request(app).get('/api/users').set('Authorization', 'Bearer SUPERADMIN');
      
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: { role: { name: { not: 'Customer' } } },
        include: { role: true, branch: true }
      });
    });

    it('COMPANY_ADMIN fetches only users in their org, excluding SUPERADMIN and COMPANY_ADMIN', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'test-id', is_active: true, role: { name: 'COMPANY_ADMIN' }, role_id: 'r2', organization_id: 'org1' } as any);
      prismaMock.user.findMany.mockResolvedValue([]);
      
      await request(app).get('/api/users').set('Authorization', 'Bearer COMPANY_ADMIN');
      
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {
          organization_id: 'org1',
          OR: [
            { id: 'test-id' },
            { role: { name: { notIn: ['Customer', 'SUPERADMIN', 'COMPANY_ADMIN'] } } }
          ]
        },
        include: { role: true, branch: true }
      });
    });

    it('BRANCH_MANAGER fetches only users in their org and branch, excluding higher roles', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'test-id', is_active: true, role: { name: 'BRANCH_MANAGER' }, role_id: 'r3', organization_id: 'org1', branch_id: 'branch1' } as any);
      prismaMock.user.findMany.mockResolvedValue([]);
      
      await request(app).get('/api/users').set('Authorization', 'Bearer BRANCH_MANAGER');
      
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {
          organization_id: 'org1',
          branch_id: 'branch1',
          OR: [
            { id: 'test-id' },
            { role: { name: { notIn: ['Customer', 'SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'] } } }
          ]
        },
        include: { role: true, branch: true }
      });
    });

    it('blocks WAITER from getting users entirely', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'test-id', is_active: true, role: { name: 'WAITER' }, role_id: 'r1', organization_id: 'org1' } as any);
      
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer WAITER');
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Insufficient permissions/);
    });
  });

  describe('User Creation Hierarchy', () => {
    it('blocks COMPANY_ADMIN from creating another COMPANY_ADMIN', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'test-id', is_active: true, role: { name: 'COMPANY_ADMIN' }, role_id: 'r1', organization_id: 'org1' } as any);
      prismaMock.role.findUnique.mockResolvedValue({ id: 'target-role', name: 'COMPANY_ADMIN' } as any);

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer COMPANY_ADMIN')
        .send({ role_id: 'target-role', username: 'test', password: 'password', email: 'test@hummyfly.com' });
      
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Cannot create user with COMPANY_ADMIN role/);
    });
  });
});
