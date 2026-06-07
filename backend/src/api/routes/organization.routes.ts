import { Router } from 'express';
import * as controller from '../../controller/organization.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.get('/profile', extractInstituteData, controller.get_organization_profile);
router.put('/profile', extractInstituteData, controller.update_organization_profile);

export default router;
