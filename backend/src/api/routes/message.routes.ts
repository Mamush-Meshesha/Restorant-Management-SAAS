import { Router } from 'express';
import * as controller from '../../controller/message.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();

router.get('/conversations', extractInstituteData, controller.get_conversations);
router.post('/start', extractInstituteData, controller.start_conversation);
router.get('/:conversationId', extractInstituteData, controller.get_messages);
router.post('/:conversationId', extractInstituteData, controller.send_message);

export default router;
