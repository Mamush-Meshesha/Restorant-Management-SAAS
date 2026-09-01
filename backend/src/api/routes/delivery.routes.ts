import { Router } from 'express';
import * as controller from '../../controller/delivery.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();

// Drivers
router.get('/drivers', extractInstituteData, controller.get_drivers);
router.post('/drivers', extractInstituteData, controller.create_driver);
router.put('/drivers/:id', extractInstituteData, controller.update_driver);
router.delete('/drivers/:id', extractInstituteData, controller.delete_driver);

// Zones
router.get('/zones', extractInstituteData, controller.get_delivery_zones);
router.post('/zones', extractInstituteData, controller.create_delivery_zone);
router.put('/zones/:id', extractInstituteData, controller.update_delivery_zone);
router.delete('/zones/:id', extractInstituteData, controller.delete_delivery_zone);

// Delivery Orders
router.get('/orders', extractInstituteData, controller.get_active_deliveries);
router.post('/orders', extractInstituteData, controller.create_delivery_order);
router.put('/orders/:id/assign', extractInstituteData, controller.assign_driver);
router.put('/orders/:id/status', extractInstituteData, controller.update_delivery_status);

export default router;
