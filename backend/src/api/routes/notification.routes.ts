import { Router } from 'express';
import * as controller from '../../controller/notification.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();

router.get('/', extractInstituteData, controller.get_notifications);
router.put('/:id/read', extractInstituteData, controller.mark_as_read);

export default router;
