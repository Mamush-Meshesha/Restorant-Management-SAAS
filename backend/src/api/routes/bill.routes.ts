import { Router } from 'express';
import * as controller from '../../controller/bill.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/generate', extractInstituteData, controller.generate_bill);
router.post('/checkout', extractInstituteData, controller.checkout_bill);

export default router;
