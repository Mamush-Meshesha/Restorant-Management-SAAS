import { Router } from 'express';
import * as controller from '../../controller/table.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/areas', extractInstituteData, controller.create_dining_area);
router.get('/areas', extractInstituteData, controller.get_dining_areas);
router.put('/areas/:id', extractInstituteData, controller.update_dining_area);
router.delete('/areas/:id', extractInstituteData, controller.delete_dining_area);
router.post('/', extractInstituteData, controller.create_table);
router.get('/', extractInstituteData, controller.get_tables);
router.put('/:id', extractInstituteData, controller.update_table);
router.delete('/:id', extractInstituteData, controller.delete_table);
router.put('/:id/status', extractInstituteData, controller.update_table_status);

export default router;
