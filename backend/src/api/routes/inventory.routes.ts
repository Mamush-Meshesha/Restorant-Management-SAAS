import { Router } from 'express';
import * as controller from '../../controller/inventory.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.get('/', extractInstituteData, controller.get_inventory);
router.post('/', extractInstituteData, controller.add_inventory_item);
router.post('/adjust', extractInstituteData, controller.adjust_stock);
router.post('/waste', extractInstituteData, controller.log_waste);

export default router;
