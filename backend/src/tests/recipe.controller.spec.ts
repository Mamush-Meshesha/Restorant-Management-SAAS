import { Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import { create_recipe, get_recipes } from '../controller/recipe.controller';

const mockUser = { id: 'user-1', organizationId: 'org-1' };

const mockRecipe = {
  id: 'recipe-1',
  menu_item_id: 'menu-1',
  instructions: 'Mix ingredients and bake',
  prep_time: 10,
  cook_time: 20,
  ingredients: [
    { id: 'ri-1', inventory_item_id: 'inv-1', quantity: 2, unit: 'cup' },
  ],
};

function makeReq(overrides: { body?: any; params?: any; query?: any; user?: any } = {}) {
  const req = httpMocks.createRequest({
    method: 'POST',
    body: overrides.body || {},
    params: overrides.params || {},
    query: overrides.query || {},
  });
  (req as any).user = overrides.user || mockUser;
  return req;
}

describe('Recipe Controller', () => {

  describe('create_recipe', () => {
    it('creates a recipe with ingredients', async () => {
      const req = makeReq({
        body: {
          menu_item_id: 'menu-1',
          instructions: 'Mix ingredients and bake',
          prep_time: 10,
          cook_time: 20,
          ingredients: [{ inventory_item_id: 'inv-1', quantity: 2, unit: 'cup' }],
        },
      });
      const res = httpMocks.createResponse();

      (prismaMock.recipe.create as jest.Mock).mockResolvedValue(mockRecipe);

      await create_recipe(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.menu_item_id).toBe('menu-1');
      expect(res._getJSONData().data.ingredients).toHaveLength(1);
      expect(prismaMock.recipe.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            menu_item_id: 'menu-1',
            ingredients: { create: [{ inventory_item_id: 'inv-1', quantity: 2, unit: 'cup' }] },
          }),
        })
      );
    });
  });

  describe('get_recipes', () => {
    it('returns all recipes', async () => {
      const req = makeReq({ query: {} });
      const res = httpMocks.createResponse();

      (prismaMock.recipe.findMany as jest.Mock).mockResolvedValue([mockRecipe]);

      await get_recipes(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
    });

    it('filters recipes by menuItemId', async () => {
      const req = makeReq({ query: { menuItemId: 'menu-1' } });
      const res = httpMocks.createResponse();

      (prismaMock.recipe.findMany as jest.Mock).mockResolvedValue([mockRecipe]);

      await get_recipes(req as any, res as unknown as Response, jest.fn());

      expect(prismaMock.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { menu_item_id: 'menu-1' },
        })
      );
    });
  });
});
