import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../services/qr.service');
import * as QRService from '../services/qr.service';

import { generate_menu_qr, generate_payment_qr, scan_qr } from '../controller/qr.controller';

function makeReq(overrides: { body?: any; params?: any; query?: any; headers?: any, ip?: string } = {}) {
  return httpMocks.createRequest({
    method: 'POST',
    body: overrides.body || {},
    params: overrides.params || {},
    query: overrides.query || {},
    headers: overrides.headers || {},
    ip: overrides.ip || '127.0.0.1'
  });
}

describe('QR Controller', () => {

  describe('generate_menu_qr', () => {
    it('returns 400 if branchId is missing', async () => {
      const req = makeReq({ body: { tableId: 'table-1' } });
      const res = httpMocks.createResponse();

      await generate_menu_qr(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toMatch(/Branch ID is required/i);
    });

    it('returns 201 with QR data on success', async () => {
      const req = makeReq({ body: { branchId: 'branch-1', tableId: 'table-1' } });
      const res = httpMocks.createResponse();

      (QRService.generateMenuQRCode as jest.Mock).mockResolvedValue({ token: '123', qrCodeDataUrl: 'data' });

      await generate_menu_qr(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.token).toBe('123');
      expect(QRService.generateMenuQRCode).toHaveBeenCalledWith('branch-1', 'table-1');
    });
  });

  describe('generate_payment_qr', () => {
    it('returns 400 if billId or amount is missing', async () => {
      const req = makeReq({ body: { billId: 'bill-1' } }); // missing amount
      const res = httpMocks.createResponse();

      await generate_payment_qr(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(400);
    });

    it('returns 201 with QR data on success', async () => {
      const req = makeReq({ body: { billId: 'bill-1', amount: 50 } });
      const res = httpMocks.createResponse();

      (QRService.generatePaymentQRCode as jest.Mock).mockResolvedValue({ token: 'abc', qrCodeDataUrl: 'data' });

      await generate_payment_qr(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.token).toBe('abc');
    });
  });

  describe('scan_qr', () => {
    it('returns 400 if QR type is invalid', async () => {
      const req = makeReq({ params: { type: 'INVALID', token: '123' } });
      const res = httpMocks.createResponse();

      await scan_qr(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(400);
    });

    it('returns 404 if QR code is not found', async () => {
      const req = makeReq({ params: { type: 'MENU', token: 'invalid-token' } });
      const res = httpMocks.createResponse();

      (QRService.logQRScan as jest.Mock).mockResolvedValue(null);

      await scan_qr(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(404);
    });

    it('returns 200 on successful scan', async () => {
      const req = makeReq({ params: { type: 'MENU', token: 'valid-token' } });
      const res = httpMocks.createResponse();

      (QRService.logQRScan as jest.Mock).mockResolvedValue({ id: 'qr-1' });

      await scan_qr(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().message).toMatch(/scanned successfully/i);
    });
  });
});
