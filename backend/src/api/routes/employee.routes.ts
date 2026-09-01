import { Router } from 'express';
import * as controller from '../../controller/employee.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();

router.use(extractInstituteData);

// Employees
router.get('/', controller.get_employees);
router.post('/', controller.create_employee);
router.put('/:id', controller.update_employee);
router.delete('/:id', controller.delete_employee);

// Departments
router.get('/departments/all', controller.get_departments);
router.post('/departments', controller.create_department);
router.put('/departments/:id', controller.update_department);
router.delete('/departments/:id', controller.delete_department);

// Positions
router.get('/positions/all', controller.get_positions);
router.post('/positions', controller.create_position);
router.put('/positions/:id', controller.update_position);
router.delete('/positions/:id', controller.delete_position);

// Employment Types
router.get('/employment-types/all', controller.get_employment_types);
router.post('/employment-types', controller.create_employment_type);
router.put('/employment-types/:id', controller.update_employment_type);
router.delete('/employment-types/:id', controller.delete_employment_type);

export default router;
