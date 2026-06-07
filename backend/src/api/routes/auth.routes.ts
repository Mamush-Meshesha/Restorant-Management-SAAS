import { Router } from 'express';
import { login, refreshToken, getMe, changePassword } from '../../controller/auth.controller';
import { authenticate } from '../../middleware/institute.middleware';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication and authorization
 */

// Public routes
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', authenticate as any, getMe);
router.post('/change-password', authenticate as any, changePassword);

export default router;
