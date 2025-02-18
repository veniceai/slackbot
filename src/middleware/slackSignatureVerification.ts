import crypto from 'crypto';

import { NextFunction, Request, Response } from 'express';

export interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

export const slackSignatureVerification = (
  req: RequestWithRawBody,
  res: Response,
  next: NextFunction,
): Response | void => {
  try {
    const timestamp = req.header('x-slack-request-timestamp');
    const signature = req.header('x-slack-signature');

    if (!timestamp || !signature) {
      console.error('Missing headers:', { signature, timestamp });
      return res.status(400).json({ error: 'Missing required Slack headers' });
    }

    if (!process.env.SLACK_SIGNING_SECRET) {
      console.error('SLACK_SIGNING_SECRET not set');
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Verify request is not older than 5 minutes
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
    if (parseInt(timestamp) < fiveMinutesAgo) {
      return res.status(401).json({ error: 'Unauthorized - Request too old' });
    }

    // Create signature to compare with Slack's
    const sigBase = 'v0:' + timestamp + ':' + req.rawBody;

    const mySignature =
      'v0=' + crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET).update(sigBase).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(mySignature), Buffer.from(signature))) {
      return res.status(401).json({ error: 'Unauthorized - Invalid signature' });
    }

    next();
  } catch (error) {
    console.error('Error in signature verification:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
