import prisma from '../lib/prisma';
import { createAuditLog } from '../lib/auditTrail';

/**
 * Deducts inventory items dynamically based on the recipe of an order item.
 * Must be called exactly once per order item, typically when kitchen status changes to COMPLETED.
 */
export const deductInventoryForOrder = async (orderItemId: string) => {
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      menuItem: {
        include: {
          recipes: {
            include: {
              ingredients: {
                include: {
                  inventoryItem: true
                }
              }
            }
          }
        }
      },
      order: true
    }
  });

  if (!orderItem) {
    throw new Error('OrderItem not found');
  }

  const recipe = orderItem.menuItem?.recipes?.[0];
  if (!recipe || !recipe.ingredients) {
    // No recipe to deduct from, safely return
    return;
  }

  // Multiply quantities by the number of ordered items
  const quantityOrdered = orderItem.quantity;

  const deductions = recipe.ingredients.map((ingredient: any) => {
    // quantity needed per single menuItem
    const requiredBaseUnits = ingredient.quantity;
    const totalRequiredBaseUnits = requiredBaseUnits * quantityOrdered;
    
    // We must deduct from the inventory item which is tracked in "unit" (e.g. KG)
    // conversion_multiplier: 1 unit = X base_units (e.g. 1 KG = 1000 Grams)
    const inventoryItem = ingredient.inventoryItem;
    const unitsToDeduct = totalRequiredBaseUnits / inventoryItem.conversion_multiplier;

    return {
      inventoryItemId: inventoryItem.id,
      unitsToDeduct
    };
  });

  // Use a transaction to perform all deductions safely
  await prisma.$transaction(async (tx) => {
    for (const deduction of deductions) {
      // First decrement the stock
      await tx.inventoryItem.update({
        where: { id: deduction.inventoryItemId },
        data: {
          current_stock: { decrement: deduction.unitsToDeduct }
        }
      });

      // Log the movement
      await tx.stockMovement.create({
        data: {
          item_id: deduction.inventoryItemId,
          type: 'OUT',
          quantity: deduction.unitsToDeduct,
          reference: `KITCHEN_ORDER_ITEM:${orderItemId}`
        }
      });
    }
  });
};
