import { Router } from 'express';
import * as controller from '../../controller/waitlist.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();

// Public endpoints for customers scanning QR
router.post('/join', controller.join_waitlist);
router.get('/:id/status', controller.get_waitlist_status);

// Protected endpoints for staff
router.get('/branch/:branchId', extractInstituteData, controller.get_branch_waitlist);
router.put('/:id/status', extractInstituteData, controller.update_waitlist_status);

export default router;
