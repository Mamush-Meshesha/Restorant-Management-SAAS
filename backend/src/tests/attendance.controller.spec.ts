import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import { clock_in, clock_out, clock_in_qr } from '../controller/attendance.controller';

const mockUser = { id: 'admin-1', branch_id: 'branch-1' };

const mockAttendance = {
  id: 'att-1',
  employee_id: 'emp-1',
  branch_id: 'branch-1',
  date: new Date(),
  clock_in: new Date(),
  clock_out: null,
  status: 'PRESENT'
};

function makeReq(overrides: { body?: any; params?: any; query?: any; user?: any } = {}) {
  const req = httpMocks.createRequest({
    method: 'POST',
    body: overrides.body || {},
    params: overrides.params || {},
    query: overrides.query || {}
  });
  (req as any).user = overrides.user || mockUser;
  // Mock req.ip and req.connection.remoteAddress
  (req as any).ip = '192.168.1.100';
  (req as any).connection = { remoteAddress: '192.168.1.100' };
  return req;
}

describe('Attendance Controller', () => {

  describe('clock_in', () => {
    it('creates a new attendance record with clock_in time', async () => {
      const req = makeReq({
        body: { employee_id: 'emp-1' }
      });
      const res = httpMocks.createResponse();

      (prismaMock.staffAttendance.create as jest.Mock).mockResolvedValue(mockAttendance);

      await clock_in(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(prismaMock.staffAttendance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            employee_id: 'emp-1',
            branch_id: 'branch-1',
            status: 'PRESENT'
          })
        })
      );
    });
  });

  describe('clock_out', () => {
    it('updates attendance record with clock_out time', async () => {
      const req = makeReq({
        body: { attendance_id: 'att-1' }
      });
      const res = httpMocks.createResponse();

      (prismaMock.staffAttendance.update as jest.Mock).mockResolvedValue({
        ...mockAttendance,
        clock_out: new Date()
      });

      await clock_out(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(prismaMock.staffAttendance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'att-1' },
          data: expect.objectContaining({
            clock_out: expect.any(Date)
          })
        })
      );
    });
  });

  describe('clock_in_qr', () => {
    it('rejects clock-in if branch is not found', async () => {
      const req = makeReq({
        body: { branch_id: 'branch-invalid', token: 'valid-token' }
      });
      const res = httpMocks.createResponse();

      (prismaMock.branch.findUnique as jest.Mock).mockResolvedValue(null);

      await clock_in_qr(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(404);
    });

    it('approves clock-in if IP matches branch wifi_ip (Bypasses GPS)', async () => {
      const req = makeReq({
        body: { branch_id: 'branch-1', token: 'valid-token' }
      });
      // req.ip is mocked to 192.168.1.100
      const res = httpMocks.createResponse();

      (prismaMock.branch.findUnique as jest.Mock).mockResolvedValue({
        id: 'branch-1',
        wifi_ip: '192.168.1.100' // Matches client IP exactly
      });
      (prismaMock.staffAttendance.create as jest.Mock).mockResolvedValue(mockAttendance);

      await clock_in_qr(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(prismaMock.staffAttendance.create).toHaveBeenCalled();
    });

    it('rejects clock-in if IP does not match and GPS is too far', async () => {
      const req = makeReq({
        body: { 
          branch_id: 'branch-1', 
          token: 'valid-token',
          lat: 40.7128, // Far away coordinates
          lng: -74.0060 
        }
      });
      (req as any).ip = '203.0.113.1'; // Bad IP
      const res = httpMocks.createResponse();

      (prismaMock.branch.findUnique as jest.Mock).mockResolvedValue({
        id: 'branch-1',
        wifi_ip: '192.168.1.100',
        latitude: 34.0522, // LA
        longitude: -118.2437
      });

      await clock_in_qr(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(403);
      const responseData = res._getJSONData();
      expect(responseData.message).toContain('Clock-in rejected');
    });

    it('approves clock-in if IP does not match but GPS is within 100 meters', async () => {
      const req = makeReq({
        body: { 
          branch_id: 'branch-1', 
          token: 'valid-token',
          lat: 34.0522, 
          lng: -118.2437 
        }
      });
      (req as any).ip = '203.0.113.1'; // Bad IP
      const res = httpMocks.createResponse();

      (prismaMock.branch.findUnique as jest.Mock).mockResolvedValue({
        id: 'branch-1',
        wifi_ip: '192.168.1.100',
        latitude: 34.05225, // Very close
        longitude: -118.24375
      });
      (prismaMock.staffAttendance.create as jest.Mock).mockResolvedValue(mockAttendance);

      await clock_in_qr(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
    });
  });
});
