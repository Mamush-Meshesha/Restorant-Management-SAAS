import { Router } from 'express';
import * as controller from '../../controller/customer.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, controller.create_customer);
router.get('/', extractInstituteData, controller.get_customers);

export default router;
