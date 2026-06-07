import QRCode from 'qrcode';
import { generateMenuQRCode, generatePaymentQRCode, logQRScan } from '../services/qr.service';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

jest.mock('qrcode', () => ({
  toDataURL: jest.fn()
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => '12345678-uuid')
}));

describe('QR Service', () => {

  beforeEach(() => {
    (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,mocked-qr-code');
  });

  describe('generateMenuQRCode', () => {
    it('creates a new menu QR code and returns data URL', async () => {
      (prismaMock.menuQRCode.create as jest.Mock).mockResolvedValue({ id: 'qr-1', token: '12345678' });

      const result = await generateMenuQRCode('branch-1', 'table-1');

      expect(prismaMock.menuQRCode.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { branch_id: 'branch-1', table_id: 'table-1', token: '12345678' }
        })
      );
      expect(QRCode.toDataURL).toHaveBeenCalled();
      expect(result.token).toBe('12345678');
      expect(result.qrCodeDataUrl).toBe('data:image/png;base64,mocked-qr-code');
    });
  });

  describe('generatePaymentQRCode', () => {
    it('creates a new payment QR code and returns data URL', async () => {
      (prismaMock.paymentQRCode.create as jest.Mock).mockResolvedValue({ id: 'pqr-1', token: '12345678-uui' });

      const result = await generatePaymentQRCode('bill-1', 50);

      expect(prismaMock.paymentQRCode.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            bill_id: 'bill-1',
            amount: 50,
            token: '12345678-uui'
          })
        })
      );
      expect(QRCode.toDataURL).toHaveBeenCalled();
      expect(result.token).toBe('12345678-uui');
      expect(result.qrCodeDataUrl).toBe('data:image/png;base64,mocked-qr-code');
    });
  });

  describe('logQRScan', () => {
    it('logs a scan for MENU QR', async () => {
      (prismaMock.menuQRCode.findUnique as jest.Mock).mockResolvedValue({ id: 'qr-1' });
      (prismaMock.qRScanLog.create as jest.Mock).mockResolvedValue({});

      const result = await logQRScan('MENU', 'token123', 'iOS', '127.0.0.1');

      expect(prismaMock.menuQRCode.findUnique).toHaveBeenCalledWith({ where: { token: 'token123' } });
      expect(prismaMock.qRScanLog.create).toHaveBeenCalledWith({
        data: { menu_qr_code_id: 'qr-1', device_type: 'iOS', ip_address: '127.0.0.1' }
      });
      expect(result).toEqual({ id: 'qr-1' });
    });

    it('logs a scan for PAYMENT QR', async () => {
      (prismaMock.paymentQRCode.findUnique as jest.Mock).mockResolvedValue({ id: 'pqr-1' });
      (prismaMock.qRScanLog.create as jest.Mock).mockResolvedValue({});

      const result = await logQRScan('PAYMENT', 'token123', 'Android', '127.0.0.1');

      expect(prismaMock.paymentQRCode.findUnique).toHaveBeenCalledWith({ where: { token: 'token123' } });
      expect(prismaMock.qRScanLog.create).toHaveBeenCalledWith({
        data: { payment_qr_code_id: 'pqr-1', device_type: 'Android', ip_address: '127.0.0.1' }
      });
      expect(result).toEqual({ id: 'pqr-1' });
    });

    it('returns null if QR code not found', async () => {
      (prismaMock.menuQRCode.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await logQRScan('MENU', 'invalid-token', 'iOS', '127.0.0.1');

      expect(result).toBeNull();
      expect(prismaMock.qRScanLog.create).not.toHaveBeenCalled();
    });
  });
});
