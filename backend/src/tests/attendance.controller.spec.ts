import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import { clock_in, clock_out } from '../controller/attendance.controller';

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
});
