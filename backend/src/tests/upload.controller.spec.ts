import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';
import { uploadFile } from '../controller/upload.controller';

// We mock multer because we don't want to actually write files to disk during tests
jest.mock('multer', () => {
  const multerMock: any = () => ({
    single: () => {
      return (req: any, res: any, cb: any) => {
        // Simulate a successful multer upload by calling the callback
        if (req.headers['x-simulate-multer-error']) {
          return cb(new multerMock.MulterError('Multer error'));
        }
        cb();
      };
    }
  });
  multerMock.diskStorage = jest.fn();
  multerMock.MulterError = class MulterError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'MulterError';
    }
  };
  return multerMock;
});

describe('Upload Controller', () => {
  it('returns 400 if multer throws an error', () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      headers: { 'x-simulate-multer-error': 'true' }
    });
    const res = httpMocks.createResponse();

    uploadFile(req, res as unknown as Response);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toBe('Multer error');
  });

  it('returns 400 if no file is uploaded', () => {
    const req = httpMocks.createRequest({ method: 'POST' });
    const res = httpMocks.createResponse();

    uploadFile(req, res as unknown as Response);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toBe('No file uploaded');
  });

  it('returns 200 and file url if upload is successful', () => {
    const req = httpMocks.createRequest({ method: 'POST' });
    (req as any).file = { filename: 'test-image.jpg' };
    const res = httpMocks.createResponse();

    uploadFile(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().url).toBe('/uploads/test-image.jpg');
  });
});
