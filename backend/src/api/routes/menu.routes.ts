import { Router } from 'express';
import * as controller from '../../controller/menu.controller';
import { extractInstituteData, requireRole } from '../../middleware/institute.middleware';

const router = Router();

const canManageMenu = requireRole('SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER');

router.post('/categories', extractInstituteData, canManageMenu, controller.create_category);
router.get('/categories', controller.get_categories); // Anyone can read
router.put('/categories/:id', extractInstituteData, canManageMenu, controller.update_category);
router.delete('/categories/:id', extractInstituteData, canManageMenu, controller.delete_category);

router.post('/items', extractInstituteData, canManageMenu, controller.create_item);
router.get('/items', controller.get_items); // Anyone can read
router.put('/items/:id', extractInstituteData, canManageMenu, controller.update_item);
router.delete('/items/:id', extractInstituteData, canManageMenu, controller.delete_item);

export default router;
