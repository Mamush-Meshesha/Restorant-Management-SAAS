import { Router } from 'express';
import * as controller from '../../controller/recipe.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, controller.create_recipe);
router.get('/', extractInstituteData, controller.get_recipes);
router.put('/:id', extractInstituteData, controller.update_recipe);
router.delete('/:id', extractInstituteData, controller.delete_recipe);

export default router;
