import { Router } from 'express';
import * as controller from '../../controller/reservation.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.get('/time-slots', controller.get_time_slots);
router.get('/available-tables', controller.get_available_tables); // No extractInstituteData since it's a public/customer endpoint and uses branch_id directly
router.post('/', extractInstituteData, controller.create_reservation);
router.get('/', extractInstituteData, controller.get_reservations);
router.put('/:id/status', extractInstituteData, controller.update_reservation_status);
router.put('/:id', extractInstituteData, controller.update_reservation);
router.delete('/:id', extractInstituteData, controller.delete_reservation);
router.post('/:id/pay-deposit', extractInstituteData, controller.pay_reservation_deposit);

export default router;
