import { Request, Response } from 'express';

export const handleInteraction = async (_: Request, res: Response): Promise<void> => {
  res.status(200).send();
};
