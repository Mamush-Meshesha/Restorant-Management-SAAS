import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

import { create_employee, get_employees } from '../controller/employee.controller';

const mockUser = { id: 'admin-1', organizationId: 'org-1' };

const mockEmployee = {
  id: 'emp-1',
  organization_id: 'org-1',
  first_name: 'John',
  last_name: 'Smith',
  email: 'john@example.com'
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

describe('Employee Controller', () => {

  describe('create_employee', () => {
    it('creates a new employee', async () => {
      const req = makeReq({
        body: {
          first_name: 'John',
          last_name: 'Smith',
          email: 'john@example.com',
          hire_date: '2026-06-01'
        }
      });
      const res = httpMocks.createResponse();

      (prismaMock.employee.create as jest.Mock).mockResolvedValue(mockEmployee);

      await create_employee(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().data.first_name).toBe('John');
      expect(prismaMock.employee.create).toHaveBeenCalled();
    });
  });

  describe('get_employees', () => {
    it('returns a list of employees', async () => {
      const req = makeReq();
      const res = httpMocks.createResponse();

      (prismaMock.employee.findMany as jest.Mock).mockResolvedValue([mockEmployee]);

      await get_employees(req as any, res as unknown as Response, jest.fn());

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().data).toHaveLength(1);
      expect(prismaMock.employee.findMany).toHaveBeenCalledWith({
        where: { organization_id: 'org-1' },
        include: { department: true, position: true, employmentType: true }
      });
    });
  });
});
