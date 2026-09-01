import { Router } from 'express';
import * as controller from '../../controller/sync.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();

// Endpoint for the edge server to push offline batches
router.post('/batch', extractInstituteData, controller.sync_offline_batch);

export default router;
