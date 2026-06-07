import { Router } from 'express';
import * as controller from '../../controller/kitchen.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.get('/orders', extractInstituteData, controller.get_kitchen_orders);
router.put('/orders/:id/status', extractInstituteData, controller.update_kitchen_order_status);
router.get('/stations', extractInstituteData, controller.get_kitchen_stations);
router.post('/stations', extractInstituteData, controller.create_kitchen_station);
router.put('/stations/:id', extractInstituteData, controller.update_kitchen_station);
router.delete('/stations/:id', extractInstituteData, controller.delete_kitchen_station);

export default router;
