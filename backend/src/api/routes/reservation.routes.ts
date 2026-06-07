import { Router } from 'express';
import * as controller from '../../controller/reservation.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, controller.create_reservation);
router.get('/', extractInstituteData, controller.get_reservations);
router.put('/:id/status', extractInstituteData, controller.update_reservation_status);

export default router;
