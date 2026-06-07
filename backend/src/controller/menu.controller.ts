import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

// Category CRUD
export const create_category = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const { name, description, image_url, display_order, parent_id } = req.body;

    const category = await prisma.menuCategory.create({
      data: {
        organization_id: orgId!,
        name,
        description,
        image_url,
        display_order: display_order || 0,
        parent_id: parent_id || null
      }
    });

    res.status(201).json({ message: "Category created", data: category });
  } catch (error) { next(error); }
};

export const update_category = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, image_url, display_order, parent_id } = req.body;
    const category = await prisma.menuCategory.update({
      where: { id },
      data: { name, description, image_url, display_order, parent_id: parent_id || null }
    });
    res.status(200).json({ message: "Category updated", data: category });
  } catch (error) { next(error); }
};

export const delete_category = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.menuCategory.delete({ where: { id } });
    res.status(200).json({ message: "Category deleted" });
  } catch (error) { next(error); }
};

export const get_categories = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const categories = await prisma.menuCategory.findMany({
      where: { organization_id: orgId, is_active: true, parent_id: null }, // Only fetch top-level categories, subcategories are included below
      orderBy: { display_order: 'asc' },
      include: {
        items: {
          where: { is_available: true }
        },
        subcategories: {
          include: {
            subcategories: {
              include: {
                subcategories: true // Allow up to 3 levels deep
              }
            }
          }
        }
      }
    });

    res.status(200).json({ data: categories });
  } catch (error) { next(error); }
};

// Item CRUD
export const create_item = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { category_id, name, description, base_price, is_vegetarian, is_vegan, allergens, image_url } = req.body;

    const item = await prisma.menuItem.create({
      data: {
        category_id,
        name,
        description,
        base_price,
        image_url,
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

export const update_item = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, base_price, is_vegetarian, is_vegan, allergens, image_url } = req.body;
    
    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        category_id, name, description, base_price, image_url,
        is_vegetarian, is_vegan, allergens
      }
    });
    res.status(200).json({ message: "Item updated", data: item });
  } catch (error) { next(error); }
};

export const delete_item = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({ where: { id } });
    res.status(200).json({ message: "Item deleted" });
  } catch (error) { next(error); }
};
