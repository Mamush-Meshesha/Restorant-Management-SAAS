import { Router } from 'express';
import * as controller from '../../controller/kitchen.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.get('/orders', extractInstituteData, controller.get_kitchen_orders);
router.put('/orders/:id/status', extractInstituteData, controller.update_kitchen_order_status);

export default router;
