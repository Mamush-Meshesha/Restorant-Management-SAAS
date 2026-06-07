import express from 'express';
import { uploadFile } from '../../controller/upload.controller';
import { authenticate } from '../../middleware/institute.middleware';

const router = express.Router();

router.post('/', authenticate, uploadFile);

export default router;
