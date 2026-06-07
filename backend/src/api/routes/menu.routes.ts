import { Router } from 'express';
import * as controller from '../../controller/menu.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/categories', extractInstituteData, controller.create_category);
router.get('/categories', extractInstituteData, controller.get_categories);
router.put('/categories/:id', extractInstituteData, controller.update_category);
router.delete('/categories/:id', extractInstituteData, controller.delete_category);
router.post('/items', extractInstituteData, controller.create_item);
router.get('/items', extractInstituteData, controller.get_items);
router.put('/items/:id', extractInstituteData, controller.update_item);
router.delete('/items/:id', extractInstituteData, controller.delete_item);

export default router;
