import { Router } from 'express';
import bodyParser from 'body-parser';
import * as roomCtrl from '../controllers/room.controller.js';
import * as recordingCtrl from '../controllers/recording.controller.js';
import * as broadcastCtrl from '../controllers/broadcasting.controller.js';
import * as authCtrl from '../controllers/auth.controller.js';
import { getConfig } from '../controllers/global-preferences/global-preferences.controller.js';
import { healthCheck } from '../controllers/healthcheck.controller.js';
import { withAdminAndUserBasicAuth, withAdminBasicAuth, withUserBasicAuth } from '../middlewares/auth.middleware.js';
import { withRecordingEnabled } from '../middlewares/recording.middleware.js';
import { withBroadcastingEnabled } from '../middlewares/broadcasting.middleware.js';

import {
	getRoomPreferences,
	updateRoomPreferences
} from '../controllers/global-preferences/room-preferences.controller.js';
import {
	getAppearancePreferences,
	updateAppearancePreferences
} from '../controllers/global-preferences/appearance-preferences.controller.js';
import rateLimit from 'express-rate-limit';

export const standaloneRouter = Router();

// Limit login attempts for avoiding brute force attacks
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 min
	max: 5,
	message: 'Too many login attempts, please try again later.'
});

standaloneRouter.use(bodyParser.urlencoded({ extended: true }));
standaloneRouter.use(bodyParser.json());

// Room Routes
standaloneRouter.post('/rooms', withUserBasicAuth, roomCtrl.createRoom);

// Recording Routes
standaloneRouter.post('/recordings', withUserBasicAuth, withRecordingEnabled, recordingCtrl.startRecording);
standaloneRouter.put('/recordings/:recordingId', withUserBasicAuth, withRecordingEnabled, recordingCtrl.stopRecording);
standaloneRouter.get('/recordings/:recordingId/stream', withRecordingEnabled, recordingCtrl.streamRecording);
standaloneRouter.delete('/recordings/:recordingId', withUserBasicAuth, withRecordingEnabled, recordingCtrl.deleteRecording);

standaloneRouter.get('/admin/recordings', withAdminBasicAuth, withRecordingEnabled, recordingCtrl.getAllRecordings);
standaloneRouter.delete(
	'/admin/recordings/:recordingId',
	withAdminBasicAuth,
	withRecordingEnabled,
	recordingCtrl.deleteRecording
);

// Broadcasting Routes
standaloneRouter.post('/broadcasts', withUserBasicAuth, withBroadcastingEnabled, broadcastCtrl.startBroadcasting);
standaloneRouter.put('/broadcasts/:broadcastId', withUserBasicAuth, withBroadcastingEnabled, broadcastCtrl.stopBroadcasting);

// Auth Routes
standaloneRouter.post('/login', authCtrl.login);
standaloneRouter.post('/logout', authCtrl.logout);
standaloneRouter.post('/admin/login', loginLimiter, authCtrl.adminLogin);
standaloneRouter.post('/admin/logout', authCtrl.adminLogout);

// Global Preferences Routes
// standaloneRouter.get('/preferences', /*withAdminBasicAuth,*/ getGlobalPreferences);

standaloneRouter.put('/preferences/room', /*withAdminBasicAuth,*/ updateRoomPreferences);
standaloneRouter.get('/preferences/room', /*withAdminBasicAuth,*/ getRoomPreferences);
standaloneRouter.put('/preferences/appearance', /*withAdminAndUserBasicAuth*/ updateAppearancePreferences);
standaloneRouter.get('/preferences/appearance', /*withAdminAndUserBasicAuth*/ getAppearancePreferences);

standaloneRouter.get('/config', getConfig); // TODO: remove this route

// Health Check Route
standaloneRouter.get('/health', /*withAdminAndUserBasicAuth,*/ healthCheck);
