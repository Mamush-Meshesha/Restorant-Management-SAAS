import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';

// ── Mock prisma BEFORE importing the controller ─────────────────────────────
jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

// ── Mock bcrypt/password helpers so tests don't need real hashes ─────────────
jest.mock('../lib/password', () => ({
  hashPassword:    jest.fn().mockResolvedValue('$2b$10$hashed'),
  comparePassword: jest.fn().mockResolvedValue(true),
}));

jest.mock('../lib/jwt', () => ({
  generateToken:        jest.fn().mockReturnValue('mock-access-token'),
  generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
  verifyToken:          jest.fn().mockReturnValue({ id: 'user-1' }),
  verifyRefreshToken:   jest.fn().mockReturnValue({ id: 'user-1' }),
}));

import { login, refreshToken, getMe, changePassword } from '../controller/auth.controller';

// ── Fixtures ─────────────────────────────────────────────────────────────────
const mockRole = { id: 'role-1', name: 'ADMIN' };
const mockOrg  = { id: 'org-1',  name: 'HummyFly HQ' };
const mockUser = {
  id:            'user-1',
  email:         'admin@hummyfly.com',
  username:      'admin',
  first_name:    'Admin',
  last_name:     'User',
  password_hash: '$2b$10$hashed',
  is_active:     true,
  role_id:       'role-1',
  organization_id: 'org-1',
  branch_id:     null,
  last_login:    null,
  role:          mockRole,
  organization:  mockOrg,
  branch:        null,
};

// Helper to create mock req/res
function makeReqRes(body: object = {}) {
  const req = httpMocks.createRequest({ method: 'POST', body });
  const res = httpMocks.createResponse();
  const next = jest.fn();
  return { req, res, next };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Auth Controller', () => {

  // ── login ────────────────────────────────────────────────────────────────
  describe('POST /login', () => {
    it('returns 400 when email or password is missing', async () => {
      const { req, res, next } = makeReqRes({ email: '' });
      await login(req as unknown as Request, res as unknown as Response, next);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toMatchObject({ message: expect.stringContaining('required') });
    });

    it('returns 401 when user does not exist', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
      const { req, res, next } = makeReqRes({ email: 'nobody@test.com', password: 'pass' });
      await login(req as unknown as Request, res as unknown as Response, next);
      expect(res.statusCode).toBe(401);
    });

    it('returns 401 when user is deactivated', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, is_active: false });
      const { req, res, next } = makeReqRes({ email: mockUser.email, password: 'pass' });
      await login(req as unknown as Request, res as unknown as Response, next);
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData().message).toMatch(/deactivated/i);
    });

    it('returns 401 when password is wrong', async () => {
      const { comparePassword } = require('../lib/password');
      (comparePassword as jest.Mock).mockResolvedValueOnce(false);
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const { req, res, next } = makeReqRes({ email: mockUser.email, password: 'wrong' });
      await login(req as unknown as Request, res as unknown as Response, next);
      expect(res.statusCode).toBe(401);
    });

    it('returns 200 with token on valid credentials', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaMock.user.update    as jest.Mock).mockResolvedValue(mockUser);
      const { req, res, next } = makeReqRes({ email: mockUser.email, password: 'correct' });
      await login(req as unknown as Request, res as unknown as Response, next);
      expect(res.statusCode).toBe(200);
      const body = res._getJSONData();
      expect(body.token).toBe('mock-access-token');
      expect(body.refreshToken).toBe('mock-refresh-token');
      expect(body.user.email).toBe(mockUser.email);
    });
  });

  // ── refreshToken ─────────────────────────────────────────────────────────
  describe('POST /refresh', () => {
    it('returns 400 when no refresh token provided', async () => {
      const { req, res, next } = makeReqRes({});
      await refreshToken(req as unknown as Request, res as unknown as Response, next);
      expect(res.statusCode).toBe(400);
    });

    it('returns 401 when refresh token is invalid', async () => {
      const { verifyRefreshToken } = require('../lib/jwt');
      (verifyRefreshToken as jest.Mock).mockReturnValueOnce(null);
      const { req, res, next } = makeReqRes({ refreshToken: 'bad-token' });
      await refreshToken(req as unknown as Request, res as unknown as Response, next);
      expect(res.statusCode).toBe(401);
    });

    it('returns 200 with new tokens on valid refresh', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const { req, res, next } = makeReqRes({ refreshToken: 'valid-refresh' });
      await refreshToken(req as unknown as Request, res as unknown as Response, next);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().token).toBe('mock-access-token');
    });
  });

  // ── getMe ────────────────────────────────────────────────────────────────
  describe('GET /me', () => {
    it('returns 401 when no user on request', async () => {
      const req = httpMocks.createRequest({ method: 'GET' });
      const res = httpMocks.createResponse();
      const next = jest.fn();
      await getMe(req as any, res as unknown as Response, next);
      expect(res.statusCode).toBe(401);
    });

    it('returns 200 with user profile when authenticated', async () => {
      const enrichedUser = {
        ...mockUser,
        role: { ...mockRole, permissions: [] },
        branch: null,
        organization: mockOrg,
      };
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(enrichedUser);
      const req = httpMocks.createRequest({ method: 'GET' });
      (req as any).user = { id: 'user-1' };
      const res = httpMocks.createResponse();
      const next = jest.fn();
      await getMe(req as any, res as unknown as Response, next);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().email).toBe(mockUser.email);
    });
  });

  // ── changePassword ───────────────────────────────────────────────────────
  describe('POST /change-password', () => {
    it('returns 400 when fields are missing', async () => {
      const req = httpMocks.createRequest({ method: 'POST', body: {} });
      (req as any).user = { id: 'user-1' };
      const res = httpMocks.createResponse();
      await changePassword(req as any, res as unknown as Response, jest.fn());
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when new password is too short', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        body: { current_password: 'old', new_password: '123' },
      });
      (req as any).user = { id: 'user-1' };
      const res = httpMocks.createResponse();
      await changePassword(req as any, res as unknown as Response, jest.fn());
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toMatch(/6 characters/i);
    });

    it('returns 200 on successful password change', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaMock.user.update    as jest.Mock).mockResolvedValue(mockUser);
      const req = httpMocks.createRequest({
        method: 'POST',
        body: { current_password: 'oldpassword', new_password: 'newpassword123' },
      });
      (req as any).user = { id: 'user-1' };
      const res = httpMocks.createResponse();
      await changePassword(req as any, res as unknown as Response, jest.fn());
      expect(res.statusCode).toBe(200);
    });
  });
});
