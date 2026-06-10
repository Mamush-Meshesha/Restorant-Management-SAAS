import { Router } from 'express';
import * as controller from '../../controller/kitchen.controller';
import { extractInstituteData, requireRole } from '../../middleware/institute.middleware';

const router = Router();

const canManageStations = requireRole('SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER');
const canManageOrders = requireRole('SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER', 'CHEF');

router.get('/orders', extractInstituteData, canManageOrders, controller.get_kitchen_orders);
router.put('/orders/:id/status', extractInstituteData, canManageOrders, controller.update_kitchen_order_status);

router.get('/stations', extractInstituteData, controller.get_kitchen_stations);
router.post('/stations', extractInstituteData, canManageStations, controller.create_kitchen_station);
router.put('/stations/:id', extractInstituteData, canManageStations, controller.update_kitchen_station);
router.delete('/stations/:id', extractInstituteData, canManageStations, controller.delete_kitchen_station);

export default router;
