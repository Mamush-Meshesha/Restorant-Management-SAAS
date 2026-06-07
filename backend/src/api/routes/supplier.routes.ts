import { Router } from 'express';
import * as controller from '../../controller/supplier.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, controller.create_supplier);
router.get('/', extractInstituteData, controller.get_suppliers);
router.post('/po', extractInstituteData, controller.create_purchase_order);

export default router;
