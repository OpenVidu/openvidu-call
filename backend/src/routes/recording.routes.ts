import { Router } from 'express';
import bodyParser from 'body-parser';
import * as recordingCtrl from '../controllers/recording.controller.js';
import { withUserBasicAuth } from '../middlewares/auth.middleware.js';
import { withRecordingEnabled } from '../middlewares/recording.middleware.js';

export const recordingRouter = Router();

recordingRouter.use(bodyParser.urlencoded({ extended: true }));
recordingRouter.use(bodyParser.json());

// Recording Routes
recordingRouter.post('/', withUserBasicAuth, /*withRecordingEnabled,*/ recordingCtrl.startRecording);
recordingRouter.put('/:recordingId', withUserBasicAuth,/* withRecordingEnabled,*/ recordingCtrl.stopRecording);
recordingRouter.get('/:recordingId/stream', /*withRecordingEnabled,*/ recordingCtrl.streamRecording);
recordingRouter.delete(
	'/:recordingId',
	withUserBasicAuth,
	/*withRecordingEnabled,*/
	recordingCtrl.deleteRecording
);
