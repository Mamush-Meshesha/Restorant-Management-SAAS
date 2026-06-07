import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import prisma from '../lib/prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role_id: string;
    role_name: string;
    organization_id: string;
    branch_id?: string | null;
    // Legacy aliases used by existing controllers
    organizationId: string;
    instituteId: string;
  };
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'User not found or deactivated' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role.name,
      organization_id: user.organization_id,
      branch_id: user.branch_id,
      organizationId: user.organization_id,
      instituteId: user.organization_id,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role_name,
      });
    }
    next();
  };
};

// Legacy aliases so old route files still compile
export const extractInstituteData = authenticate;
export const requireInstituteAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  next();
};