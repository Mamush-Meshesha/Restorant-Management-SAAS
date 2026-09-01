import { Router } from 'express';
import * as controller from '../../controller/role.controller';
import { extractInstituteData, requirePermission } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, requirePermission('ROLES', 'can_create'), controller.create_role);
router.get('/', extractInstituteData, requirePermission('ROLES', 'can_read'), controller.get_roles);
router.put('/:id', extractInstituteData, requirePermission('ROLES', 'can_update'), controller.update_role);
router.delete('/:id', extractInstituteData, requirePermission('ROLES', 'can_delete'), controller.delete_role);

export default router;
