import { Router } from 'express';
import * as controller from '../../controller/branch.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, controller.create_branch);
router.get('/', extractInstituteData, controller.get_branches);

export default router;
