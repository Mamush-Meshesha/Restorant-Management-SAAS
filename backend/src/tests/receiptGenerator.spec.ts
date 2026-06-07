import { generateReceiptId } from '../utils/receiptGenerator';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

describe('receiptGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReceiptId', () => {
    it('generates a unique receipt ID', async () => {
      (prismaMock.bill.findUnique as jest.Mock).mockResolvedValue(null);

      const id = await generateReceiptId();
      expect(id).toMatch(/^RCP[0-9]{8}[A-Z0-9]{4}$/);
      expect(prismaMock.bill.findUnique).toHaveBeenCalled();
    });

    it('appends a counter if receipt ID already exists', async () => {
      // First call returns an existing bill, second call returns null
      (prismaMock.bill.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 'existing-bill' })
        .mockResolvedValueOnce(null);

      const id = await generateReceiptId();
      
      // Should have appended counter '01'
      expect(id).toMatch(/^RCP[0-9]{8}[A-Z0-9]{4}01$/);
      expect(prismaMock.bill.findUnique).toHaveBeenCalledTimes(2);
    });

    it('throws error if counter exceeds 99', async () => {
      // Always return existing bill to simulate infinite loop
      (prismaMock.bill.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-bill' });

      await expect(generateReceiptId()).rejects.toThrow('Unable to generate unique receipt ID');
      expect(prismaMock.bill.findUnique).toHaveBeenCalledTimes(99);
    });
  });
});
