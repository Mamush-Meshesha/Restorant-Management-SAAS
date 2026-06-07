import { Router } from 'express';
import * as controller from '../../controller/order.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, controller.create_order);
router.get('/', extractInstituteData, controller.get_orders);
router.put('/:id/status', extractInstituteData, controller.update_order_status);
router.put('/:id/cancel', extractInstituteData, controller.cancel_order);

export default router;
