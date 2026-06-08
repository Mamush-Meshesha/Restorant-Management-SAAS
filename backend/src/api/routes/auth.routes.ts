import { Router } from 'express';
import { login, refreshToken, getMe, changePassword, register } from '../../controller/auth.controller';
import { authenticate } from '../../middleware/institute.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', authenticate as any, getMe);
router.post('/change-password', authenticate as any, changePassword);

export default router;
