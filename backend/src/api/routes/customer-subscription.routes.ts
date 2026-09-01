import express from 'express';
import * as controller from '../../controller/customer-subscription.controller';
import { extractInstituteData, authenticate } from '../../middleware/institute.middleware';

const router = express.Router();

router.get('/plans', controller.get_subscription_plans);
router.get('/my-subscriptions', authenticate, controller.get_my_subscriptions);
router.post('/subscribe', authenticate, controller.subscribe);

export default router;
