import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, refreshToken, getMe, changePassword, register, forgotPassword, resetPassword, logout, verify2fa } from '../../controller/auth.controller';
import { authenticate } from '../../middleware/institute.middleware';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/verify-2fa', verify2fa);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticate as any, getMe);
router.post('/change-password', authenticate as any, changePassword);
router.post('/logout', authenticate as any, logout);

export default router;
