import express from 'express';

import { handleCommand } from '../handlers/commandHandler';
import { eventHandler } from '../handlers/eventHandler';
import { handleInteraction } from '../handlers/interactionHandler';

const router = express.Router();

router.post('/events', eventHandler);
router.post('/commands', handleCommand);
router.post('/interactions', handleInteraction);

export default router;
