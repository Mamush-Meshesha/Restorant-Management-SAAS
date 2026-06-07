import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import {
  create_category,
  update_category,
  delete_category,
  get_categories,
  get_items,
} from '../controller/menu.controller';

// ── Fixtures ─────────────────────────────────────────────────────────────────
const mockUser = {
  id:             'user-1',
  organization_id: 'org-1',
  organizationId:  'org-1',
  instituteId:     'org-1',
};

const mockCategory = {
  id:              'cat-1',
  organization_id: 'org-1',
  name:            'Starters',
  description:     'Appetizers and starters',
  image_url:       null,
  display_order:   0,
  parent_id:       null,
  is_active:       true,
  subcategories:   [],
};

const mockItem = {
  id:          'item-1',
  name:        'Samosa',
  base_price:  3.5,
  is_available: true,
  category_id: 'cat-1',
  category:    mockCategory,
  variants:    [],
  addons:      [],
};

function makeReq(overrides: { body?: any; params?: any; query?: any; user?: any } = {}) {
  const req = httpMocks.createRequest({
    body:   overrides.body   ?? {},
    params: overrides.params ?? {},
    query:  overrides.query  ?? {},
  });
  (req as any).user = overrides.user ?? mockUser;
  return req;
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Menu Controller', () => {

  // ── create_category ──────────────────────────────────────────────────────
  describe('POST /menu/categories', () => {
    it('creates and returns a category with 201', async () => {
      (prismaMock.menuCategory.create as jest.Mock).mockResolvedValue(mockCategory);
      const req = makeReq({ body: { name: 'Starters', display_order: 0 } });
      const res = httpMocks.createResponse();
      await create_category(req as any, res as any, jest.fn());
      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.name).toBe('Starters');
      expect(prismaMock.menuCategory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Starters', organization_id: 'org-1' }),
        })
      );
    });

    it('calls next on error', async () => {
      const err = new Error('DB failure');
      (prismaMock.menuCategory.create as jest.Mock).mockRejectedValue(err);
      const req = makeReq({ body: { name: 'Oops' } });
      const res = httpMocks.createResponse();
      const next = jest.fn();
      await create_category(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── get_categories ───────────────────────────────────────────────────────
  describe('GET /menu/categories', () => {
    it('returns top-level categories for the org', async () => {
      (prismaMock.menuCategory.findMany as jest.Mock).mockResolvedValue([mockCategory]);
      const req = makeReq();
      const res = httpMocks.createResponse();
      await get_categories(req as any, res as any, jest.fn());
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
      expect(prismaMock.menuCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organization_id: 'org-1', parent_id: null }),
        })
      );
    });

    it('returns empty array when no categories', async () => {
      (prismaMock.menuCategory.findMany as jest.Mock).mockResolvedValue([]);
      const req = makeReq();
      const res = httpMocks.createResponse();
      await get_categories(req as any, res as any, jest.fn());
      expect(res._getJSONData().data).toEqual([]);
    });
  });

  // ── update_category ──────────────────────────────────────────────────────
  describe('PATCH /menu/categories/:id', () => {
    it('updates and returns the category', async () => {
      const updated = { ...mockCategory, name: 'Updated Starters' };
      (prismaMock.menuCategory.update as jest.Mock).mockResolvedValue(updated);
      const req = makeReq({ params: { id: 'cat-1' }, body: { name: 'Updated Starters' } });
      const res = httpMocks.createResponse();
      await update_category(req as any, res as any, jest.fn());
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data.name).toBe('Updated Starters');
    });
  });

  // ── delete_category ──────────────────────────────────────────────────────
  describe('DELETE /menu/categories/:id', () => {
    it('deletes and returns success message', async () => {
      (prismaMock.menuCategory.delete as jest.Mock).mockResolvedValue(mockCategory);
      const req = makeReq({ params: { id: 'cat-1' } });
      const res = httpMocks.createResponse();
      await delete_category(req as any, res as any, jest.fn());
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().message).toMatch(/deleted/i);
    });
  });

  // ── get_items ────────────────────────────────────────────────────────────
  describe('GET /menu/items', () => {
    it('returns all available items without category filter', async () => {
      (prismaMock.menuItem.findMany as jest.Mock).mockResolvedValue([mockItem]);
      const req = makeReq();
      const res = httpMocks.createResponse();
      await get_items(req as any, res as any, jest.fn());
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
      expect(prismaMock.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { is_available: true } })
      );
    });

    it('filters items by categoryId when provided', async () => {
      (prismaMock.menuItem.findMany as jest.Mock).mockResolvedValue([mockItem]);
      const req = makeReq({ query: { categoryId: 'cat-1' } });
      const res = httpMocks.createResponse();
      await get_items(req as any, res as any, jest.fn());
      expect(prismaMock.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { is_available: true, category_id: 'cat-1' },
        })
      );
    });
  });
});
