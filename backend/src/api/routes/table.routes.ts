import { Router } from 'express';
import * as controller from '../../controller/table.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/areas', extractInstituteData, controller.create_dining_area);
router.get('/areas', extractInstituteData, controller.get_dining_areas);
router.post('/', extractInstituteData, controller.create_table);

export default router;
