import { Router } from 'express';
import * as controller from '../../controller/order.controller';
import { extractInstituteData, requireRole } from '../../middleware/institute.middleware';

const router = Router();

const canCancelOrder = requireRole('SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER');
const canUpdateOrderStatus = requireRole('SUPERADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER', 'CHEF', 'WAITER', 'CASHIER');

// Any authenticated staff or customer can create and read orders
router.post('/', extractInstituteData, controller.create_order);
router.get('/', extractInstituteData, controller.get_orders);

// Only staff can update order status (e.g., to PREPARING, READY)
router.put('/:id/status', extractInstituteData, canUpdateOrderStatus, controller.update_order_status);

// Only managers and above can cancel orders
router.put('/:id/cancel', extractInstituteData, canCancelOrder, controller.cancel_order);

export default router;
