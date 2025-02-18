import { Request, Response } from 'express';

export const eventHandler = async (req: Request, res: Response): Promise<void> => {
  // Handle URL verification challenge
  if (req.body.type === 'url_verification') {
    if (!req.body.challenge) {
      res.status(400).json({ error: 'Bad Request - Missing challenge parameter' });
      return;
    }
    res.json({ challenge: req.body.challenge });
    return;
  }

  // Handle other event types
  res.status(200).send();
};
