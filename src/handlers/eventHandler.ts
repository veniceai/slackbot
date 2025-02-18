import { Request, Response } from 'express';

export const eventHandler = async (_: Request, res: Response): Promise<void> => {
  res.status(200).send();
};
