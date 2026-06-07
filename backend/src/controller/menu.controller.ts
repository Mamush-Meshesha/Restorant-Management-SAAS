import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

// Category CRUD
export const create_category = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const { name, description, image_url, display_order } = req.body;

    const category = await prisma.menuCategory.create({
      data: {
        organization_id: orgId!,
        name,
        description,
        image_url,
        display_order: display_order || 0
      }
    });

    res.status(201).json({ message: "Category created", data: category });
  } catch (error) { next(error); }
};

export const get_categories = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const categories = await prisma.menuCategory.findMany({
      where: { organization_id: orgId, is_active: true },
      orderBy: { display_order: 'asc' },
      include: {
        items: {
          where: { is_available: true }
        }
      }
    });

    res.status(200).json({ data: categories });
  } catch (error) { next(error); }
};

// Item CRUD
export const create_item = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { category_id, name, description, base_price, is_vegetarian, is_vegan, allergens } = req.body;

    const item = await prisma.menuItem.create({
      data: {
        category_id,
        name,
        description,
        base_price,
        is_vegetarian: is_vegetarian || false,
        is_vegan: is_vegan || false,
        allergens: allergens || []
      }
    });

    res.status(201).json({ message: "Item created", data: item });
  } catch (error) { next(error); }
};

export const get_items = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.query;
    const whereClause: any = { is_available: true };
    if (categoryId) {
      whereClause.category_id = String(categoryId);
    }

    const items = await prisma.menuItem.findMany({
      where: whereClause,
      include: {
        category: true,
        variants: true,
        addons: true
      }
    });

    res.status(200).json({ data: items });
  } catch (error) { next(error); }
};
