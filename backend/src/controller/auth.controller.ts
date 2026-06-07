import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../lib/password';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../lib/jwt';

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        branch: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is deactivated. Contact your administrator.' });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    const loginExpiry = new Date();
    loginExpiry.setDate(loginExpiry.getDate() + 1);

    return res.status(200).json({
      message: 'Login successful',
      token,
      refreshToken,
      loginExpiry: loginExpiry.toISOString(),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role_id: user.role_id,
        role: {
          role_id: user.role.id,
          role_name: user.role.name,
        },
        organization_id: user.organization_id,
        organization: user.organization,
        branch_id: user.branch_id,
        branch: user.branch,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'User not found' });
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const loginExpiry = new Date();
    loginExpiry.setDate(loginExpiry.getDate() + 1);

    return res.status(200).json({
      token: newToken,
      refreshToken: newRefreshToken,
      loginExpiry: loginExpiry.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 */
export const getMe = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        role: {
          include: { permissions: true },
        },
        branch: { select: { id: true, name: true, code: true } },
        organization: { select: { id: true, name: true, logo: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id,
      role: {
        role_id: user.role.id,
        role_name: user.role.name,
        permissions: user.role.permissions,
      },
      organization_id: user.organization_id,
      organization: user.organization,
      branch_id: user.branch_id,
      branch: user.branch,
      last_login: user.last_login,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/v1/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password for authenticated user
 *     security:
 *       - bearerAuth: []
 */
export const changePassword = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ message: 'current_password and new_password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await comparePassword(current_password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

    const newHash = await hashPassword(new_password);
    await prisma.user.update({ where: { id: user.id }, data: { password_hash: newHash } });

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
