import express, { Router } from 'express';
import { lkWebhookHandler } from '../controllers/livekit-webhook.controller.js';

const livekitRouter = Router();

livekitRouter.use(express.raw({ type: 'application/webhook+json' }));
livekitRouter.post('/', lkWebhookHandler);

export { livekitRouter };
