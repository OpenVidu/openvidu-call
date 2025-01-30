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

export const apiRouter = Router();

// Limit login attempts for avoiding brute force attacks
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 min
	max: 5,
	message: 'Too many login attempts, please try again later.'
});

apiRouter.use(bodyParser.urlencoded({ extended: true }));
apiRouter.use(bodyParser.json());

// Room Routes
apiRouter.post('/rooms', withUserBasicAuth, roomCtrl.createRoom);

// Recording Routes
apiRouter.post('/recordings', withUserBasicAuth, withRecordingEnabled, recordingCtrl.startRecording);
apiRouter.put('/recordings/:recordingId', withUserBasicAuth, withRecordingEnabled, recordingCtrl.stopRecording);
apiRouter.get('/recordings/:recordingId/stream', withRecordingEnabled, recordingCtrl.streamRecording);
apiRouter.delete('/recordings/:recordingId', withUserBasicAuth, withRecordingEnabled, recordingCtrl.deleteRecording);

apiRouter.get('/admin/recordings', withAdminBasicAuth, withRecordingEnabled, recordingCtrl.getAllRecordings);
apiRouter.delete(
	'/admin/recordings/:recordingId',
	withAdminBasicAuth,
	withRecordingEnabled,
	recordingCtrl.deleteRecording
);

// Broadcasting Routes
apiRouter.post('/broadcasts', withUserBasicAuth, withBroadcastingEnabled, broadcastCtrl.startBroadcasting);
apiRouter.put('/broadcasts/:broadcastId', withUserBasicAuth, withBroadcastingEnabled, broadcastCtrl.stopBroadcasting);

// Auth Routes
apiRouter.post('/login', authCtrl.login);
apiRouter.post('/logout', authCtrl.logout);
apiRouter.post('/admin/login', loginLimiter, authCtrl.adminLogin);
apiRouter.post('/admin/logout', authCtrl.adminLogout);

// Global Preferences Routes
// apiRouter.get('/preferences', /*withAdminBasicAuth,*/ getGlobalPreferences);

apiRouter.put('/preferences/room', /*withAdminBasicAuth,*/ updateRoomPreferences);
apiRouter.get('/preferences/room', /*withAdminBasicAuth,*/ getRoomPreferences);
apiRouter.put('/preferences/appearance', /*withAdminAndUserBasicAuth*/ updateAppearancePreferences);
apiRouter.get('/preferences/appearance', /*withAdminAndUserBasicAuth*/ getAppearancePreferences);

apiRouter.get('/config', getConfig); // TODO: remove this route

// Health Check Route
apiRouter.get('/health', /*withAdminAndUserBasicAuth,*/ healthCheck);
