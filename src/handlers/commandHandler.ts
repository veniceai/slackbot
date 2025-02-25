import { Request, Response } from 'express';

import { chatHandler } from './chatHandler';
import { imageHandler } from './imageHandler';

import type { SlackCommandPayload } from './types/SlackCommandPayload';

export const handleCommand = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body as SlackCommandPayload;

    // Validate required fields
    if (!payload.command || !payload.text || !payload.channel_id) {
      res.status(400).json({ error: 'Invalid command payload' });
      return;
    }

    // Validate command length
    if (payload.text.length > 1500) {
      res.status(400).json({ error: 'Command text too long' });
      return;
    }

    if (payload.command === '/venice') {
      // Send immediate acknowledgment to Slack
      res.status(200).send();

      const text = payload.text.trim();
      if (text.startsWith('chat ')) {
        // Trim off the command portion
        const trimmedPayload = { ...payload, text: text.replace(/^chat\s+/, '').trim() };
        return await chatHandler(trimmedPayload);
      }

      const trimmedPayload = text.startsWith('image ')
        ? { ...payload, text: text.replace(/^image\s+/, '').trim() }
        : payload;
      await imageHandler(trimmedPayload);
    }
  } catch (e) {
    console.error('Error handling command:', e);
  }
};
