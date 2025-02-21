import { Router } from 'express';
import bodyParser from 'body-parser';

import * as broadcastCtrl from '../controllers/broadcasting.controller.js';
import { withUserBasicAuth } from '../middlewares/auth.middleware.js';

import { withBroadcastingEnabled } from '../middlewares/broadcasting.middleware.js';

export const broadcastingRouter = Router();

broadcastingRouter.use(bodyParser.urlencoded({ extended: true }));
broadcastingRouter.use(bodyParser.json());

// Broadcasting Routes
broadcastingRouter.post('/', withUserBasicAuth, withBroadcastingEnabled, broadcastCtrl.startBroadcasting);
broadcastingRouter.put('/:broadcastId', withUserBasicAuth, withBroadcastingEnabled, broadcastCtrl.stopBroadcasting);
