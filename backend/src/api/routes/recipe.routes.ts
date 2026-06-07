import { Router } from 'express';
import * as controller from '../../controller/recipe.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();
router.post('/', extractInstituteData, controller.create_recipe);
router.get('/', extractInstituteData, controller.get_recipes);

export default router;
