import { Router } from 'express';
import * as controller from '../../controller/user.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, controller.create_user);
router.get('/', extractInstituteData, controller.get_users);

export default router;
