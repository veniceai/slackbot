import express from 'express';

// Mock the dotenv config and set required env vars
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Store handlers for testing
const handlers: Record<string, Function> = {};

// Mock express
jest.mock('express', () => {
  const mockRouter = {
    get: jest.fn((path, handler) => {
      handlers[`GET ${path}`] = handler;
    }),
    post: jest.fn((path, handler) => {
      handlers[`POST ${path}`] = handler;
    }),
    use: jest.fn((path, handler) => {
      handlers[`USE ${path}`] = handler;
    }),
    listen: jest.fn(),
  };

  const mockExpress: any = jest.fn(() => mockRouter);
  mockExpress.json = jest.fn();
  mockExpress.urlencoded = jest.fn();
  mockExpress.Router = jest.fn(() => mockRouter);
  return mockExpress;
});

process.env.VENICE_API_KEY = 'test-api-key';
process.env.NODE_ENV = 'test';

// Import after mocks
import '../app';
const app = express();

describe('Express App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('should return 200 and ok status for /health endpoint', () => {
      const req = {} as express.Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as express.Response;

      const healthHandler = handlers['GET /health'];
      if (!healthHandler) throw new Error('Health handler not found');

      healthHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
    });
  });

  describe('URL Verification', () => {
    it('should handle valid URL verification request', () => {
      const challenge = 'test_challenge';
      const req = {
        body: {
          type: 'url_verification',
          challenge,
        },
      } as express.Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as express.Response;

      const rootHandler = handlers['POST /'];
      if (!rootHandler) throw new Error('Root handler not found');

      rootHandler(req, res);
      expect(res.json).toHaveBeenCalledWith({ challenge });
    });

    it('should reject requests without url_verification type', (done) => {
      const req = {
        body: {
          type: 'other_type',
          challenge: 'test',
        },
      } as express.Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as express.Response;

      const rootHandler = handlers['POST /'];
      if (!rootHandler) throw new Error('Root handler not found');

      rootHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Forbidden - Only URL verification allowed',
      });
      done();
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', () => {
      const originalConsoleLog = console.log;
      console.log = jest.fn();

      const req = {
        method: 'GET',
        originalUrl: '/unknown-route',
      } as express.Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as express.Response;

      const notFoundHandler = handlers['USE *'];
      if (!notFoundHandler) throw new Error('Not found handler not found');

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });

      console.log = originalConsoleLog;
    });
  });
});
