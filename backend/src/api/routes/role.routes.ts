import { Router } from 'express';
import * as controller from '../../controller/role.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, controller.create_role);
router.get('/', extractInstituteData, controller.get_roles);

export default router;
