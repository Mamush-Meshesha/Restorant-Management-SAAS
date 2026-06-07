import { Router } from 'express';
import * as qrController from '../../controller/qr.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();

// Public route to log scan and fetch data
router.get('/scan/:type/:token', qrController.scan_qr);

// Protected routes to generate QR codes
router.post('/menu', extractInstituteData, qrController.generate_menu_qr);
router.post('/payment', extractInstituteData, qrController.generate_payment_qr);

export default router;
