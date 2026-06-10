import { Router } from 'express';
import * as controller from '../../controller/user.controller';
import { extractInstituteData, requireRole } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, requireRole('SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'), controller.create_user);
router.get('/', extractInstituteData, requireRole('SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'), controller.get_users);

export default router;
