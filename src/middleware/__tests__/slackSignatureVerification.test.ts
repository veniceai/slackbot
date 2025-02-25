import crypto from 'crypto';
import { Response, NextFunction } from 'express';
import { RequestWithRawBody, slackSignatureVerification } from '../slackSignatureVerification';

// Mock environment variable
const MOCK_SIGNING_SECRET = 'test-secret';
process.env.SLACK_SIGNING_SECRET = MOCK_SIGNING_SECRET;

describe('slackSignatureVerification', () => {
  let mockReq: Partial<RequestWithRawBody>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    mockReq = {
      headers: {},
      rawBody: Buffer.from('test-body'),
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  it('should call next() with valid signature', () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const sigBase = `v0:${timestamp}:${mockReq.rawBody}`;
    const signature = 'v0=' + crypto.createHmac('sha256', MOCK_SIGNING_SECRET).update(sigBase).digest('hex');

    mockReq.headers = {
      'x-slack-signature': signature,
      'x-slack-request-timestamp': timestamp,
    };

    slackSignatureVerification(mockReq as RequestWithRawBody, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid signature', () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    // Create a valid-length but incorrect signature (64 hex chars after 'v0=')
    const invalidSignature = 'v0=' + '1234567890abcdef'.repeat(4);

    mockReq.headers = {
      'x-slack-signature': invalidSignature,
      'x-slack-request-timestamp': timestamp,
    };

    slackSignatureVerification(mockReq as RequestWithRawBody, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unauthorized - Invalid signature',
    });
  });

  it('should return 401 for missing headers', () => {
    slackSignatureVerification(mockReq as RequestWithRawBody, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unauthorized - Missing headers',
    });
  });

  it('should return 401 for expired timestamp', () => {
    const oldTimestamp = (Math.floor(Date.now() / 1000) - 301).toString(); // 5 minutes + 1 second ago
    const sigBase = `v0:${oldTimestamp}:${mockReq.rawBody}`;
    const signature = 'v0=' + crypto.createHmac('sha256', MOCK_SIGNING_SECRET).update(sigBase).digest('hex');

    mockReq.headers = {
      'x-slack-signature': signature,
      'x-slack-request-timestamp': oldTimestamp,
    };

    slackSignatureVerification(mockReq as RequestWithRawBody, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unauthorized - Request too old',
    });
  });

  it('should return 500 when SLACK_SIGNING_SECRET is not set', () => {
    const originalSecret = process.env.SLACK_SIGNING_SECRET;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    delete process.env.SLACK_SIGNING_SECRET;

    slackSignatureVerification(mockReq as RequestWithRawBody, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
    expect(consoleSpy).toHaveBeenCalledWith('SLACK_SIGNING_SECRET not set');

    // Cleanup
    process.env.SLACK_SIGNING_SECRET = originalSecret;
    consoleSpy.mockRestore();
  });
});
