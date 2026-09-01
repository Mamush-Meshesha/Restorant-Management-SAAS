import { Router } from 'express';
import * as controller from '../../controller/attendance.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/clock-in', extractInstituteData, controller.clock_in);
router.post('/clock-in/qr', extractInstituteData, controller.clock_in_qr);
router.post('/clock-out', extractInstituteData, controller.clock_out);

// Management routes
router.get('/', extractInstituteData, controller.get_attendance_logs);
router.post('/', extractInstituteData, controller.manual_create);
router.put('/:id', extractInstituteData, controller.manual_update);

export default router;
