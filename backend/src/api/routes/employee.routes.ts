import { Router } from 'express';
import * as controller from '../../controller/employee.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, controller.create_employee);
router.get('/', extractInstituteData, controller.get_employees);

export default router;
