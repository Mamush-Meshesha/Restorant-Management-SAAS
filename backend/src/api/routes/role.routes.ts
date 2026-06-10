import { Router } from 'express';
import * as controller from '../../controller/role.controller';
import { extractInstituteData, requireRole } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, requireRole('SUPERADMIN', 'COMPANY_ADMIN'), controller.create_role);
router.get('/', extractInstituteData, requireRole('SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'), controller.get_roles);

export default router;
