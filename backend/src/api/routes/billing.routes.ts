import { Router } from 'express';
import * as controller from '../../controller/billing.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();

router.get('/subscription', extractInstituteData, controller.get_subscription_status);
router.get('/plans', extractInstituteData, controller.get_available_plans);
router.post('/upgrade', extractInstituteData, controller.upgrade_subscription);
router.get('/invoices', extractInstituteData, controller.get_billing_history);
router.get('/invoices/:id/pdf', extractInstituteData, controller.download_invoice_pdf);

export default router;
