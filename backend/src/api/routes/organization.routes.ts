import { Router } from 'express';
import * as controller from '../../controller/organization.controller';
import { extractInstituteData, requireRole } from '../../middleware/institute.middleware';

const router = Router();

// Any authenticated user can read the organization profile
router.get('/profile', extractInstituteData, controller.get_organization_profile);

// Only COMPANY_ADMIN and SUPERADMIN can update the organization profile
router.put('/profile', extractInstituteData, requireRole('SUPERADMIN', 'COMPANY_ADMIN'), controller.update_organization_profile);

export default router;
