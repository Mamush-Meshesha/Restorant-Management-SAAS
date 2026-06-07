import { Router } from 'express';
import * as controller from '../../controller/analytics.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/expenses', extractInstituteData, controller.create_expense);
router.get('/expenses', extractInstituteData, controller.get_expenses);
router.get('/revenue/summary', extractInstituteData, controller.get_revenue_summary);
router.get('/revenue/daily', extractInstituteData, controller.get_daily_revenue);

export default router;
