import { Router } from 'express';
import * as controller from '../../controller/supplier.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, controller.create_supplier);
router.get('/', extractInstituteData, controller.get_suppliers);
router.put('/:id', extractInstituteData, controller.update_supplier);
router.delete('/:id', extractInstituteData, controller.delete_supplier);

router.post('/po', extractInstituteData, controller.create_purchase_order);
router.get('/po', extractInstituteData, controller.get_purchase_orders);

export default router;
