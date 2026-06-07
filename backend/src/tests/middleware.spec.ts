import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

jest.mock('../lib/jwt', () => ({
  verifyToken: jest.fn(),
}));
import { verifyToken } from '../lib/jwt';

import { authenticate, requireRole } from '../middleware/institute.middleware';

// ── Fixtures ─────────────────────────────────────────────────────────────────
const mockUser = {
  id:              'user-1',
  email:           'admin@hummyfly.com',
  username:        'admin',
  password_hash:   '$2b$10$hashed',
  is_active:       true,
  role_id:         'role-1',
  organization_id: 'org-1',
  branch_id:       null,
  role:            { id: 'role-1', name: 'ADMIN' },
};

// ─────────────────────────────────────────────────────────────────────────────
describe('Institute Middleware (authenticate)', () => {

  it('returns 401 when no Authorization header', async () => {
    const req = httpMocks.createRequest({ headers: {} });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await authenticate(req as any, res as any, next);
    expect(res.statusCode).toBe(401);
    expect(res._getJSONData().message).toMatch(/No token/i);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header is not Bearer', async () => {
    const req = httpMocks.createRequest({ headers: { authorization: 'Basic abc123' } });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await authenticate(req as any, res as any, next);
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when token verification fails', async () => {
    (verifyToken as jest.Mock).mockReturnValueOnce(null);
    const req = httpMocks.createRequest({ headers: { authorization: 'Bearer invalid-token' } });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await authenticate(req as any, res as any, next);
    expect(res.statusCode).toBe(401);
    expect(res._getJSONData().message).toMatch(/Invalid or expired/i);
  });

  it('returns 401 when user does not exist', async () => {
    (verifyToken as jest.Mock).mockReturnValueOnce({ id: 'ghost-user' });
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
    const req = httpMocks.createRequest({ headers: { authorization: 'Bearer valid-token' } });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await authenticate(req as any, res as any, next);
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when user is deactivated', async () => {
    (verifyToken as jest.Mock).mockReturnValueOnce({ id: 'user-1' });
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, is_active: false });
    const req = httpMocks.createRequest({ headers: { authorization: 'Bearer valid-token' } });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await authenticate(req as any, res as any, next);
    expect(res.statusCode).toBe(401);
  });

  it('calls next and sets req.user on valid token', async () => {
    (verifyToken as jest.Mock).mockReturnValueOnce({ id: 'user-1' });
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const req = httpMocks.createRequest({ headers: { authorization: 'Bearer valid-token' } });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await authenticate(req as any, res as any, next);
    expect(next).toHaveBeenCalledWith();
    expect((req as any).user).toMatchObject({
      id:             'user-1',
      role_name:      'ADMIN',
      organization_id: 'org-1',
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('requireRole middleware', () => {
  it('returns 401 when no user on request', () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = jest.fn();
    requireRole('ADMIN')(req as any, res as any, next);
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 when user role is not in allowed list', () => {
    const req = httpMocks.createRequest();
    (req as any).user = { ...mockUser, role_name: 'WAITER' };
    const res = httpMocks.createResponse();
    const next = jest.fn();
    requireRole('ADMIN', 'MANAGER')(req as any, res as any, next);
    expect(res.statusCode).toBe(403);
    expect(res._getJSONData().message).toMatch(/Insufficient/i);
  });

  it('calls next when user role is allowed', () => {
    const req = httpMocks.createRequest();
    (req as any).user = { ...mockUser, role_name: 'ADMIN' };
    const res = httpMocks.createResponse();
    const next = jest.fn();
    requireRole('ADMIN', 'MANAGER')(req as any, res as any, next);
    expect(next).toHaveBeenCalledWith();
  });
});
