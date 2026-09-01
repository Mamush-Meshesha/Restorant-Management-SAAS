import { Router } from 'express';
import * as controller from '../../controller/billing.controller';
import { extractInstituteData, requireRole } from '../../middleware/institute.middleware';

const router = Router();

router.get('/subscription', extractInstituteData, controller.get_subscription_status);
router.get('/plans', extractInstituteData, controller.get_available_plans);
router.post('/upgrade', extractInstituteData, controller.upgrade_subscription);
router.post('/cancel', extractInstituteData, controller.cancel_subscription);
router.get('/invoices', extractInstituteData, controller.get_billing_history);
router.get('/invoices/:id/pdf', extractInstituteData, controller.download_invoice_pdf);

// Superadmin Plan Management
const isSuperAdmin = requireRole('SUPERADMIN');
router.post('/plans', extractInstituteData, isSuperAdmin, controller.create_plan);
router.put('/plans/:id', extractInstituteData, isSuperAdmin, controller.update_plan);
router.delete('/plans/:id', extractInstituteData, isSuperAdmin, controller.delete_plan);

export default router;
