import { Router } from 'express';
import { open_register, close_register, get_active_register } from '../../controller/register.controller';
import { authenticate } from '../../middleware/institute.middleware';

const router = Router();

router.post('/open', authenticate, open_register);
router.post('/close', authenticate, close_register);
router.get('/active', authenticate, get_active_register);

export default router;
