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
    const { name, description, image_url, display_order, parent_id, is_active } = req.body;
    
    // Build update data dynamically to allow partial updates
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (image_url !== undefined) data.image_url = image_url;
    if (display_order !== undefined) data.display_order = display_order;
    if (parent_id !== undefined) data.parent_id = parent_id || null;
    if (is_active !== undefined) data.is_active = is_active;

    const category = await prisma.menuCategory.update({
      where: { id },
      data
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
    const orgId = req.user?.organizationId || req.user?.instituteId || (req.query.organizationId as string);
    if (!orgId) return res.status(400).json({ message: "organizationId is required" });
    const categories = await prisma.menuCategory.findMany({
      where: { organization_id: orgId, parent_id: null }, // Admins need to see all categories to manage them
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
    const { category_id, name, description, base_price, is_vegetarian, is_vegan, is_gluten_free, allergens, image_url, variants = [], addons = [] } = req.body;

    const item = await prisma.menuItem.create({
      data: {
        category_id,
        name,
        description,
        base_price,
        image_url,
        is_vegetarian: is_vegetarian || false,
        is_vegan: is_vegan || false,
        is_gluten_free: is_gluten_free || false,
        allergens: allergens || [],
        variants: variants.length > 0 ? { create: variants } : undefined,
        addons: addons.length > 0 ? { create: addons } : undefined
      },
      include: { variants: true, addons: true }
    });

    res.status(201).json({ message: "Item created", data: item });
  } catch (error) { next(error); }
};

export const get_items = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { categoryId, organizationId } = req.query;
    const whereClause: any = {}; // Dashboard needs all items (even sold out). POS can filter active.
    
    // If not authenticated, restrict to active items only
    if (!req.user) {
      whereClause.is_available = true;
    }

    if (categoryId) {
      whereClause.category_id = String(categoryId);
    }
    
    // For public fetching, we might fetch all items for an org
    if (organizationId) {
      whereClause.category = { organization_id: String(organizationId) };
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
    const { category_id, name, description, base_price, is_vegetarian, is_vegan, is_gluten_free, allergens, image_url, is_available, variants, addons } = req.body;
    
    const data: any = {};
    if (category_id !== undefined) data.category_id = category_id;
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (base_price !== undefined) data.base_price = base_price;
    if (image_url !== undefined) data.image_url = image_url;
    if (is_vegetarian !== undefined) data.is_vegetarian = is_vegetarian;
    if (is_vegan !== undefined) data.is_vegan = is_vegan;
    if (is_gluten_free !== undefined) data.is_gluten_free = is_gluten_free;
    if (allergens !== undefined) data.allergens = allergens;
    if (is_available !== undefined) data.is_available = is_available;

    if (variants) {
      data.variants = { deleteMany: {}, create: variants };
    }
    if (addons) {
      data.addons = { deleteMany: {}, create: addons };
    }

    const item = await prisma.menuItem.update({
      where: { id },
      data,
      include: { variants: true, addons: true }
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
