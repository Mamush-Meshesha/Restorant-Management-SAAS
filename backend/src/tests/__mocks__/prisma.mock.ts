
const mockPrismaClient: any = {
  user: {
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
    count:      jest.fn(),
  },
  role: {
    findFirst:  jest.fn(),
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  organization: {
    findFirst:  jest.fn(),
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
  },
  branch: {
    findFirst:  jest.fn(),
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  menuCategory: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  menuItem: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  order: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    aggregate:  jest.fn(),
  },
  subscription: {
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
  },
  subscriptionPlan: {
    findFirst:  jest.fn(),
    findUnique: jest.fn(),
    findMany:   jest.fn(),
  },
  subscriptionHistory: {
    create: jest.fn(),
  },
  subscriptionInvoice: {
    create:     jest.fn(),
    findMany:   jest.fn(),
    findUnique: jest.fn(),
  },
  subscriptionPayment: {
    create: jest.fn(),
  },
  reservation: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
  },
  customer: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
  },
  table: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  diningArea: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  menuQRCode: {
    findUnique: jest.fn(),
    create:     jest.fn(),
  },
  paymentQRCode: {
    findUnique: jest.fn(),
    create:     jest.fn(),
  },
  qRScanLog: {
    create: jest.fn(),
  },
  employee: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
  },
  staffAttendance: {
    findMany:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
  },
  kitchenStation: {
    findFirst:  jest.fn(),
    findMany:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  kitchenOrder: {
    findMany:   jest.fn(),
    createMany: jest.fn(),
    update:     jest.fn(),
  },
  orderItem: {
    update:     jest.fn(),
  },
  inventoryItem: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  stockAdjustment: {
    create: jest.fn(),
  },
  wasteLog: {
    create: jest.fn(),
  },
  recipe: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
  },
  supplier: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
  },
  purchaseOrder: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
  },
  bill: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
  },
  expense: {
    findMany:   jest.fn(),
    create:     jest.fn(),
    aggregate:  jest.fn(),
  },
  revenueReport: {
    findMany:   jest.fn(),
  },
  transaction: {
    create: jest.fn(),
  },
  fiscalYear: {
    findFirst:  jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
  },
  notification: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    createMany: jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  $connect:    jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn((fn: (tx: any) => Promise<any>) => fn(mockPrismaClient)),
};

// Reset all mocks between tests automatically
afterEach(() => {
  Object.values(mockPrismaClient).forEach((model: any) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((fn: any) => {
        if (typeof fn === 'function' && fn.mockReset) fn.mockReset();
      });
    }
  });
});

export default mockPrismaClient;
