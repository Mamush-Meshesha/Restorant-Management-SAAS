import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../lib/password';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { createAuditLog } from '../lib/auditTrail';
import jwt from 'jsonwebtoken';

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
      // Cannot create an audit log without a valid organization_id
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      await createAuditLog({ entity_type: 'USER', entity_id: user.id, action: 'LOGIN_FAILED_INACTIVE', user_id: user.id, organization_id: user.organization_id, ip_address: req.ip });
      return res.status(401).json({ message: 'Account is deactivated. Contact your administrator.' });
    }

    if (user.locked_until && new Date() < user.locked_until) {
      await createAuditLog({ entity_type: 'USER', entity_id: user.id, action: 'LOGIN_FAILED_LOCKED', user_id: user.id, organization_id: user.organization_id, ip_address: req.ip });
      return res.status(401).json({ message: 'Account is temporarily locked due to too many failed attempts. Please try again later.' });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      const updates: any = { failed_login_attempts: attempts };
      let locked = false;
      if (attempts >= 5) {
        const lockTime = new Date();
        lockTime.setMinutes(lockTime.getMinutes() + 15);
        updates.locked_until = lockTime;
        locked = true;
      }
      await prisma.user.update({ where: { id: user.id }, data: updates });
      
      await createAuditLog({ entity_type: 'USER', entity_id: user.id, action: locked ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED_PASSWORD', user_id: user.id, organization_id: user.organization_id, ip_address: req.ip });
      return res.status(401).json({ message: locked ? 'Account locked due to too many failed attempts. Try again in 15 minutes.' : 'Invalid email or password' });
    }

    if (user.is_2fa_enabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { two_factor_code: code, two_factor_expires: expires }
      });

      // Send the email (assuming you imported sendEmail from '../lib/email')
      // Note: we need to import sendEmail at the top if it isn't.
      const { sendEmail } = require('../lib/email');
      await sendEmail({
        to: user.email,
        subject: 'Your 2FA Verification Code',
        template: '2fa-code',
        data: { username: user.first_name || user.username, code }
      });

      return res.status(200).json({
        message: '2FA required',
        requires_2fa: true,
        userId: user.id
      });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date(), failed_login_attempts: 0, locked_until: null },
    });

    const loginExpiry = new Date();
    loginExpiry.setDate(loginExpiry.getDate() + 1);

    await createAuditLog({ entity_type: 'USER', entity_id: user.id, action: 'LOGIN_SUCCESS', user_id: user.id, organization_id: user.organization_id, ip_address: req.ip });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };
    res.cookie('token', token, { ...cookieOptions, expires: loginExpiry });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

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

export const verify2fa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ message: 'User ID and code are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        branch: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true } },
      },
    });

    if (!user || user.two_factor_code !== code) {
      return res.status(401).json({ message: 'Invalid or expired 2FA code' });
    }
    
    if (!user.two_factor_expires || new Date() > user.two_factor_expires) {
      return res.status(401).json({ message: '2FA code has expired' });
    }

    // Code is valid, clear it
    await prisma.user.update({
      where: { id: user.id },
      data: { two_factor_code: null, two_factor_expires: null, last_login: new Date(), failed_login_attempts: 0, locked_until: null },
    });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    const loginExpiry = new Date();
    loginExpiry.setDate(loginExpiry.getDate() + 1);

    await createAuditLog({ entity_type: 'USER', entity_id: user.id, action: 'LOGIN_SUCCESS_2FA', user_id: user.id, organization_id: user.organization_id, ip_address: req.ip });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };
    res.cookie('token', token, { ...cookieOptions, expires: loginExpiry });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

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

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { first_name, last_name, email, password, phone, organization_id } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    let defaultOrg;
    if (organization_id) {
      defaultOrg = await prisma.organization.findUnique({ where: { id: organization_id } });
    } else {
      defaultOrg = await prisma.organization.findFirst();
    }
    
    if (!defaultOrg) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    let customerRole = await prisma.role.findFirst({
      where: { name: "Customer", organization_id: defaultOrg.id }
    });
    
    if (!customerRole) {
      customerRole = await prisma.role.create({
        data: { name: "Customer", organization_id: defaultOrg.id }
      });
    }

    const hashedPassword = await hashPassword(password);
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash: hashedPassword,
        first_name,
        last_name,
        organization_id: defaultOrg.id,
        role_id: customerRole.id,
      },
      include: {
        role: true,
        organization: true,
      }
    });

    const customerPhone = phone || `reg_${Date.now()}`;

    await prisma.customer.upsert({
      where: { phone: customerPhone },
      update: {},
      create: {
        organization_id: defaultOrg.id,
        first_name,
        last_name,
        email,
        phone: customerPhone,
      }
    });

    // --- Notify Admins ---
    const admins = await prisma.user.findMany({
      where: {
        organization_id: defaultOrg.id,
        role: { name: { in: ['SUPERADMIN', 'COMPANY_ADMIN'] } }
      }
    });

    if (admins.length > 0) {
      const notifs = admins.map(admin => ({
        user_id: admin.id,
        title: "New Customer Registration",
        message: `${first_name} ${last_name} has registered as a new customer.`,
        type: "USER_REGISTERED",
        is_read: false,
        organization_id: defaultOrg.id
      }));
      await prisma.notification.createMany({ data: notifs });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    const loginExpiry = new Date();
    loginExpiry.setDate(loginExpiry.getDate() + 1);

    await createAuditLog({ entity_type: 'USER', entity_id: user.id, action: 'REGISTER', user_id: user.id, organization_id: user.organization_id, ip_address: req.ip });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };
    res.cookie('token', token, { ...cookieOptions, expires: loginExpiry });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

    return res.status(201).json({
      message: 'Registration successful',
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
        organization_id: user.organization_id,
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
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(400).json({ message: 'Refresh token required' });
    }
    
    const isRevoked = await prisma.revokedToken.findUnique({ where: { token } });
    if (isRevoked) {
      return res.status(401).json({ message: 'Token has been revoked' });
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

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };
    res.cookie('token', newToken, { ...cookieOptions, expires: loginExpiry });
    res.cookie('refreshToken', newRefreshToken, { ...cookieOptions, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

    return res.status(200).json({
      message: 'Token refreshed successfully'
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
    await prisma.user.update({ where: { id: user.id }, data: { password_hash: newHash, password_changed_at: new Date() } });

    await createAuditLog({ entity_type: 'USER', entity_id: user.id, action: 'PASSWORD_CHANGED', user_id: user.id, organization_id: user.organization_id, ip_address: req.ip });

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const resetToken = jwt.sign({ id: user.id, type: 'reset' }, process.env.JWT_SECRET || 'fallback-secret-change-me', { expiresIn: '15m' });
    
    await createAuditLog({ entity_type: 'USER', entity_id: user.id, action: 'PASSWORD_RESET_REQUESTED', user_id: user.id, organization_id: user.organization_id, ip_address: req.ip });
    
    console.log(`[MOCK EMAIL] Password reset token for ${email}: ${resetToken}`);
    
    return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.', mock_token: resetToken });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) return res.status(400).json({ message: 'Token and new password are required' });
    if (new_password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-me') as { id: string, type: string };
      if (decoded.type !== 'reset') return res.status(401).json({ message: 'Invalid token type' });

      const newHash = await hashPassword(new_password);
      const user = await prisma.user.update({ where: { id: decoded.id }, data: { password_hash: newHash, password_changed_at: new Date() } });

      await createAuditLog({ entity_type: 'USER', entity_id: user.id, action: 'PASSWORD_RESET_COMPLETED', user_id: user.id, organization_id: user.organization_id, ip_address: req.ip });

      return res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) {
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      return res.status(200).json({ message: 'Logged out successfully' });
    }

    const decoded = verifyRefreshToken(token);
    let expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    if (decoded) {
      const decodedJwt = jwt.decode(token) as { exp: number };
      if (decodedJwt && decodedJwt.exp) {
        expiresAt = new Date(decodedJwt.exp * 1000);
      }
    }

    await prisma.revokedToken.create({
      data: {
        token,
        expires_at: expiresAt
      }
    });

    if (req.user) {
      await createAuditLog({ entity_type: 'USER', entity_id: req.user.id, action: 'LOGOUT', user_id: req.user.id, organization_id: req.user.organizationId, ip_address: req.ip });
    }

    res.clearCookie('token');
    res.clearCookie('refreshToken');

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
