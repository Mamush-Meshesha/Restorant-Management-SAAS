import { Router } from 'express';
import * as controller from '../../controller/analytics.controller';
import * as dashboardController from '../../controller/dashboard.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/expenses', extractInstituteData, controller.create_expense);
router.get('/expenses', extractInstituteData, controller.get_expenses);
router.post('/expense-categories', extractInstituteData, controller.create_expense_category);
router.get('/expense-categories', extractInstituteData, controller.get_expense_categories);
router.get('/revenue/summary', extractInstituteData, controller.get_revenue_summary);
router.get('/revenue/daily', extractInstituteData, controller.get_daily_revenue);
router.get('/dashboard', extractInstituteData, dashboardController.get_live_dashboard);

export default router;
