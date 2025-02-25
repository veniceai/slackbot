import { Request, Response } from 'express';
import { eventHandler } from '../eventHandler';

describe('eventHandler', () => {
  it('should return 200 status', async () => {
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    await eventHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });
});
