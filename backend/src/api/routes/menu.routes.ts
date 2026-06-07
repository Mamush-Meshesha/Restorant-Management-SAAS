import { Router } from 'express';
import * as controller from '../../controller/menu.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/categories', extractInstituteData, controller.create_category);
router.get('/categories', extractInstituteData, controller.get_categories);
router.post('/items', extractInstituteData, controller.create_item);
router.get('/items', extractInstituteData, controller.get_items);

export default router;
