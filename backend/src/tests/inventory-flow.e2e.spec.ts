import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import router from '../api/index';
import jwt from 'jsonwebtoken';
import { deductInventoryForOrder } from '../services/inventory.service';

const app = express();
app.use(express.json());
app.use(cookieParser());
router(app);

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

jest.mock('../lib/auditTrail', () => ({ createAuditLog: jest.fn() }));

describe('Inventory & Supply Chain E2E Tests', () => {
  const adminToken = jwt.sign(
    { id: 'admin-1', role_name: 'BRANCH_MANAGER', organizationId: 'org-1', branch_id: 'branch-1' },
    process.env.JWT_SECRET || 'fallback-secret-change-me'
  );

  beforeEach(() => {
    jest.clearAllMocks();

    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'admin-1',
      is_active: true,
      role: { name: 'BRANCH_MANAGER' },
      organization_id: 'org-1',
      branch_id: 'branch-1'
    });
  });

  describe('Inventory Deductions (Unit of Measurement)', () => {
    it('should correctly deduct stock converted to base units when an order is READY', async () => {
      // Mock the OrderItem -> MenuItem -> Recipe -> RecipeIngredient -> InventoryItem structure
      (prismaMock.orderItem.findUnique as jest.Mock).mockResolvedValue({
        id: 'order-item-1',
        quantity: 2, // 2 burgers ordered
        menuItem: {
          recipes: [
            {
              ingredients: [
                {
                  quantity: 200, // 200 grams of meat per burger
                  inventoryItem: {
                    id: 'inv-meat',
                    conversion_multiplier: 1000 // 1 KG = 1000 Grams
                  }
                }
              ]
            }
          ]
        },
        order: { branch_id: 'branch-1' }
      });

      await deductInventoryForOrder('order-item-1');

      // It should deduct: (200 grams * 2 items) / 1000 multiplier = 0.4 KG
      expect(prismaMock.inventoryItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-meat' },
          data: { current_stock: { decrement: 0.4 } }
        })
      );
      
      expect(prismaMock.stockMovement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            item_id: 'inv-meat',
            quantity: 0.4,
            type: 'OUT'
          })
        })
      );
    });
  });

  describe('Waste Logging on Cancellations', () => {
    it('should create a WasteLog if a cancelled order was already cooked', async () => {
      (prismaMock.orderItem.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'order-item-1',
          quantity: 2,
          unit_price: 15,
          menuItem: { name: 'Burger' },
          order: { branch_id: 'branch-1' },
          kitchenOrders: [
            { status: 'READY' } // It was already cooked!
          ]
        }
      ]);

      (prismaMock.order.update as jest.Mock).mockResolvedValue({ status: 'CANCELLED' });

      const res = await request(app)
        .put('/api/v1/order/order-1/cancel')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(prismaMock.wasteLog.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            item_name: 'Burger',
            quantity: 2,
            cost_loss: 30, // 2 * 15
            reason: 'ORDER_CANCELLED'
          })
        ]
      });
      expect(prismaMock.order.update).toHaveBeenCalled();
    });

    it('should create a single WasteLog if an already cooked item is voided securely', async () => {
      (prismaMock.orderItem.findUnique as jest.Mock).mockResolvedValue({
        id: 'order-item-1',
        order_id: 'order-1',
        quantity: 1,
        unit_price: 20,
        order: { status: 'PENDING', branch_id: 'branch-1' }
      });

      (prismaMock.kitchenOrder.findMany as jest.Mock).mockResolvedValue([
        { status: 'READY' }
      ]);
      
      (prismaMock.menuItem.findUnique as jest.Mock).mockResolvedValue({
        id: 'menu-1',
        name: 'Steak'
      });
      
      (prismaMock.orderItem.findMany as jest.Mock).mockResolvedValue([]);
      (prismaMock.order.update as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .put('/api/v1/order/item/order-item-1/void')
        .set('Cookie', [`token=${adminToken}`])
        .send({ reason: 'Customer changed mind', wasted: true });

      expect(res.status).toBe(200);
      expect(prismaMock.wasteLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          item_name: 'Steak',
          quantity: 1,
          cost_loss: 20,
          reason: 'VOIDED: Customer changed mind'
        })
      });
    });
  });
});
