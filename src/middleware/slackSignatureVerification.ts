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
    const signature = req.headers['x-slack-signature'] as string;
    const timestamp = req.headers['x-slack-request-timestamp'] as string;

    if (!process.env.SLACK_SIGNING_SECRET) {
      console.error('SLACK_SIGNING_SECRET not set');
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!signature || !timestamp) {
      return res.status(401).json({ error: 'Unauthorized - Missing headers' });
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
