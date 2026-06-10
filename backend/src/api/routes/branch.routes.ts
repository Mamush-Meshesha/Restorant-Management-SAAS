import { Router } from 'express';
import * as controller from '../../controller/branch.controller';
import { extractInstituteData, requireRole } from '../../middleware/institute.middleware';

const router = Router();
router.get('/public', controller.get_public_branches);
router.post('/', extractInstituteData, requireRole('SUPERADMIN', 'COMPANY_ADMIN'), controller.create_branch);
router.get('/', extractInstituteData, requireRole('SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'), controller.get_branches);

export default router;
