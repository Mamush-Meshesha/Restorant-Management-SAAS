import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const JWT_EXPIRY = process.env.JWT_EXPIREY || '1d';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIREY || '7d';

export interface JwtPayload {
  id: string;
  email: string;
  role_id: string;
  organization_id: string;
  branch_id?: string | null;
}

export const generateToken = (user: User): string => {
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    role_id: user.role_id,
    organization_id: user.organization_id,
    branch_id: user.branch_id,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY as any });
};

export const generateRefreshToken = (user: User): string => {
  const payload = { id: user.id, type: 'refresh' };
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY as any });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): { id: string } | null => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as { id: string };
  } catch {
    return null;
  }
};