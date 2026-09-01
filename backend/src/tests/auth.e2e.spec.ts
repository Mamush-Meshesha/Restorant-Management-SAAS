import request from 'supertest';
import express from 'express';
import router from '../api/index';
import jwt from 'jsonwebtoken';

// Setup app explicitly for testing to avoid hanging on app.listen
const app = express();
app.use(express.json());
router(app);

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

jest.mock('../lib/password', () => ({
  hashPassword: jest.fn().mockResolvedValue('$2b$10$hashed'),
  comparePassword: jest.fn().mockResolvedValue(true),
}));

jest.mock('../lib/auditTrail', () => ({
  createAuditLog: jest.fn().mockResolvedValue(true),
}));

// We will use actual middleware and just mock the prisma responses to pass authenticate()

describe('Auth & RBAC E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rate Limiting on /api/v1/auth/login', () => {
    it('should block requests after 5 attempts', async () => {
      // Mock user not found for fast failure
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      const loginAttempt = () => request(app).post('/api/v1/auth/login').send({ email: 'test@test.com', password: 'password' });

      // 5 requests should be allowed (returns 401 because user not found)
      for (let i = 0; i < 5; i++) {
        const res = await loginAttempt();
        expect(res.status).toBe(401);
      }

      // 6th request should be rate limited
      const rateLimitedRes = await loginAttempt();
      expect(rateLimitedRes.status).toBe(429); // Too Many Requests
    });
  });

  describe('Password Reset Flow', () => {
    it('should return a mock token on forgot-password', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', email: 'user@test.com' });

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'user@test.com' });
      
      expect(res.status).toBe(200);
      expect(res.body.mock_token).toBeDefined();
    });

    it('should reset password with valid token', async () => {
      const resetToken = jwt.sign({ id: 'user-1', type: 'reset' }, process.env.JWT_SECRET || 'fallback-secret-change-me');
      (prismaMock.user.update as jest.Mock).mockResolvedValue({ id: 'user-1' });

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ token: resetToken, new_password: 'new_secure_password' });

      expect(res.status).toBe(200);
      expect(prismaMock.user.update).toHaveBeenCalled();
    });
  });

  describe('Token Revocation (Logout)', () => {
    it('should create a RevokedToken entry on logout', async () => {
      (prismaMock.revokedToken.create as jest.Mock).mockResolvedValue(true);
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ 
        id: 'user-1', is_active: true, role: { name: 'CUSTOMER' }, organization_id: 'org-1'
      });
      const token = jwt.sign({ id: 'user-1' }, process.env.JWT_SECRET || 'fallback-secret-change-me');
      const refreshToken = jwt.sign({ id: 'user-1' }, process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret');

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken });
      
      expect(res.status).toBe(200);
      expect(prismaMock.revokedToken.create).toHaveBeenCalled();
    });
  });

  describe('Cross-Tenant Validation (Users)', () => {
    it('should forbid BRANCH_MANAGER from creating a user in another branch', async () => {
      const token = jwt.sign({ id: 'manager-1' }, process.env.JWT_SECRET || 'fallback-secret-change-me');
      
      // First, mock findUnique for the authenticate middleware
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ 
        id: 'manager-1', is_active: true, role_id: 'role-1', role: { name: 'BRANCH_MANAGER' }, organization_id: 'org-1', branch_id: 'branch-1' 
      });

      // Mock permission for requirePermission middleware
      (prismaMock.permission.findFirst as jest.Mock).mockResolvedValue({
        id: 'perm-1',
        feature_key: 'USERS',
        can_create: true
      });
      
      // Second, mock branch findUnique for the branch cross-tenant check in create_user
      (prismaMock.branch.findUnique as jest.Mock).mockResolvedValue({ id: 'branch-2', organization_id: 'org-2' }); // Target branch in different org

      const res = await request(app)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          branch_id: 'branch-2',
          first_name: 'Hacker',
          last_name: 'User',
          email: 'hacker@test.com',
          password: 'password123'
        });

      // The controller returns 403 because branch-2 belongs to org-2
      expect(res.status).toBe(403);
    });
  });
});
