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

  describe('User Routes', () => {
    it('allows COMPANY_ADMIN to get users', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'test-id', is_active: true, role: { name: 'COMPANY_ADMIN' }, role_id: 'r1', organization_id: 'org1' } as any);
      prismaMock.user.findMany.mockResolvedValue([]);
      
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer COMPANY_ADMIN');
      expect(res.status).toBe(200);
    });

    it('blocks WAITER from getting users', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'test-id', is_active: true, role: { name: 'WAITER' }, role_id: 'r1', organization_id: 'org1' } as any);
      
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer WAITER');
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Insufficient permissions/);
    });
  });

  describe('Branch Routes', () => {
    it('blocks BRANCH_MANAGER from creating a branch', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'test-id', is_active: true, role: { name: 'BRANCH_MANAGER' }, role_id: 'r1', organization_id: 'org1' } as any);
      
      const res = await request(app)
        .post('/api/branches')
        .set('Authorization', 'Bearer BRANCH_MANAGER')
        .send({ name: 'New Branch', code: 'NB' });
      expect(res.status).toBe(403);
    });

    it('allows SUPERADMIN to create a branch', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'test-id', is_active: true, role: { name: 'SUPERADMIN' }, role_id: 'r1', organization_id: 'org1' } as any);
      prismaMock.branch.create.mockResolvedValue({ id: 'b1' } as any);
      
      const res = await request(app)
        .post('/api/branches')
        .set('Authorization', 'Bearer SUPERADMIN')
        .send({ name: 'New Branch', code: 'NB' });
      expect(res.status).toBe(201);
    });
  });
});
