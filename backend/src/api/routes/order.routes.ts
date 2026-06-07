import { Router } from 'express';
import * as controller from '../../controller/order.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, controller.create_order);
router.get('/', extractInstituteData, controller.get_orders);

export default router;
