import { Request, Response } from 'express';
import { handleInteraction } from '../interactionHandler';

describe('handleInteraction', () => {
  it('should return 200 status', async () => {
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    await handleInteraction(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });
});
