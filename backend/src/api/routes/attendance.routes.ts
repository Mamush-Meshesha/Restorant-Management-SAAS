import { Router } from 'express';
import * as controller from '../../controller/attendance.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/clock-in', extractInstituteData, controller.clock_in);
router.post('/clock-in/qr', extractInstituteData, controller.clock_in_qr);
router.post('/clock-out', extractInstituteData, controller.clock_out);

export default router;
