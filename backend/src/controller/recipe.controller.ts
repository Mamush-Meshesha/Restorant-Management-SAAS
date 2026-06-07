import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const create_recipe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { menu_item_id, instructions, prep_time, cook_time, ingredients } = req.body;
    // ingredients: [{ inventory_item_id, quantity, unit }]

    const recipe = await prisma.recipe.create({
      data: {
        menu_item_id,
        instructions,
        prep_time,
        cook_time,
        ingredients: {
          create: ingredients
        }
      },
      include: { ingredients: true }
    });

    res.status(201).json({ message: "Recipe created", data: recipe });
  } catch (error) { next(error); }
};

export const get_recipes = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { menuItemId } = req.query;

    const whereClause: any = {};
    if (menuItemId) whereClause.menu_item_id = String(menuItemId);

    const recipes = await prisma.recipe.findMany({
      where: whereClause,
      include: {
        menuItem: true,
        ingredients: { include: { inventoryItem: true } }
      }
    });

    res.status(200).json({ data: recipes });
  } catch (error) { next(error); }
};
