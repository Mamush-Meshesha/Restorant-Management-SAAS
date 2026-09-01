import { Router } from 'express';
import * as controller from '../../controller/user.controller';
import { extractInstituteData, requirePermission } from '../../middleware/institute.middleware';

const router = Router();
router.post('/2fa/toggle', extractInstituteData, controller.toggle2fa);
router.post('/', extractInstituteData, requirePermission('USERS', 'can_create'), controller.create_user);
router.get('/', extractInstituteData, requirePermission('USERS', 'can_read'), controller.get_users);
router.put('/:id', extractInstituteData, requirePermission('USERS', 'can_update'), controller.update_user);

export default router;
