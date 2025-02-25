import { Request, Response } from 'express';
import { handleCommand } from '../commandHandler';
import { chatHandler } from '../chatHandler';
import { imageHandler } from '../imageHandler';

jest.mock('../chatHandler', () => ({
  chatHandler: jest.fn(),
}));

jest.mock('../imageHandler', () => ({
  imageHandler: jest.fn(),
}));

describe('commandHandler', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  } as unknown as Response;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle chat command', async () => {
    const req = {
      body: {
        command: '/venice',
        text: 'chat Hello world',
        channel_id: 'channel123',
        response_url: 'http://response.url',
      },
    } as Request;

    await handleCommand(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(chatHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Hello world',
        channel_id: 'channel123',
      }),
    );
  });

  it('should handle image command', async () => {
    const req = {
      body: {
        command: '/venice',
        text: 'image A beautiful sunset',
        channel_id: 'channel123',
      },
    } as Request;

    await handleCommand(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(imageHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'A beautiful sunset',
        channel_id: 'channel123',
      }),
    );
  });

  it('should handle default image command', async () => {
    const req = {
      body: {
        command: '/venice',
        text: 'A beautiful sunset',
        channel_id: 'channel123',
      },
    } as Request;

    await handleCommand(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(imageHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'A beautiful sunset',
        channel_id: 'channel123',
      }),
    );
  });

  it('should return 400 for missing required fields', async () => {
    const req = {
      body: {
        command: '/venice',
      },
    } as Request;

    await handleCommand(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid command payload' });
  });

  it('should return 400 for text too long', async () => {
    const req = {
      body: {
        command: '/venice',
        text: 'a'.repeat(1501),
        channel_id: 'channel123',
      },
    } as Request;

    await handleCommand(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Command text too long' });
  });
});
