import { Router } from 'express';
import * as controller from '../../controller/loyalty.controller';
import { extractInstituteData, requireRole } from '../../middleware/institute.middleware';

const router = Router();

const canManageLoyalty = requireRole('SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER');

// All loyalty routes require organization context
router.use(extractInstituteData);

router.get('/', controller.get_loyalty_data);
router.put('/settings', canManageLoyalty, controller.update_loyalty_program);

router.post('/tiers', canManageLoyalty, controller.create_tier);
router.delete('/tiers/:id', canManageLoyalty, controller.delete_tier);

export default router;
