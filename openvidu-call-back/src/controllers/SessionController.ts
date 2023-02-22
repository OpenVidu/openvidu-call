import * as crypto from 'crypto';
import * as express from 'express';
import { Request, Response } from 'express';
import { OpenViduRole, Session } from 'openvidu-node-client';
import { CALL_BROADCAST, CALL_RECORDING } from '../config';
import { OpenViduService } from '../services/OpenViduService';

export const app = express.Router({
	strict: true
});

const openviduService = OpenViduService.getInstance();

app.post('/', async (req: Request, res: Response) => {
	try {
		console.log('Session ID received', req.body.sessionId);

		let sessionId: string = req.body.sessionId;
		let nickname: string = req.body.nickname;
		let date = null;
		let sessionCreated: Session = await openviduService.createSession(sessionId);
		const MODERATOR_TOKEN_NAME = openviduService.MODERATOR_TOKEN_NAME;
		const IS_RECORDING_ENABLED = CALL_RECORDING.toUpperCase() === 'ENABLED';
		const IS_BROADCASTING_ENABLED = CALL_BROADCAST.toUpperCase() === 'ENABLED';
		const PRIVATE_FEATURES_ENABLED = IS_RECORDING_ENABLED || IS_BROADCASTING_ENABLED;
		const hasValidToken = openviduService.isValidToken(sessionId, req.cookies);
		const isSessionCreator = hasValidToken || sessionCreated.activeConnections.length === 0;
		const role: OpenViduRole = isSessionCreator ? OpenViduRole.MODERATOR : OpenViduRole.PUBLISHER;
		const response = {
			cameraToken: (await openviduService.createConnection(sessionCreated, nickname, role)).token,
			screenToken: (await openviduService.createConnection(sessionCreated, nickname, role)).token,
			recordingEnabled: IS_RECORDING_ENABLED,
			broadcastingEnabled: IS_BROADCASTING_ENABLED,
			recordings: [],
			isRecordingActive: sessionCreated.recording,
			isBroadcastingActive: sessionCreated.broadcasting
		};

		if (isSessionCreator && !hasValidToken && PRIVATE_FEATURES_ENABLED ) {
			/**
			 * ! *********** WARN *********** !
			 *
			 * To identify who is able to manage session recording and broadcasting,
			 * the code sends a cookie with a token to the session creator.
			 * The relation between cookies and sessions are stored in backend memory.
			 *
			 * This authentication & authorization system is pretty basic and it is not for production.
			 * We highly recommend IMPLEMENT YOUR OWN USER MANAGEMENT with persistence for a properly and secure recording feature.
			 *
			 * ! *********** WARN *********** !
			 **/
			const uuid = crypto.randomBytes(32).toString('hex');
			date = Date.now();
			const moderatorToken = `${response.cameraToken}&${MODERATOR_TOKEN_NAME}=${uuid}&createdAt=${date}`;
			res.cookie(MODERATOR_TOKEN_NAME, moderatorToken);
			openviduService.recordingMap.set(sessionId, { token: moderatorToken, recordingId: '' });
		}

		if (IS_RECORDING_ENABLED) {
			date = date || openviduService.getDateFromCookie(req.cookies);
			try {
				response.recordings = await openviduService.listRecordingsBySessionIdAndDate(sessionId, date);
			} catch (error) {
				if (error.message === '501') {
					console.warn('[WARN] Recording is disabled in OpenVidu Server.');
				}
			}
		}

		res.status(200).send(JSON.stringify(response));
	} catch (error) {
		console.error(error);
		let message = 'Cannot connect with OpenVidu Server';
		let code = Number(error?.message);
		if (error.message === 500) {
			message = 'Unexpected error when creating the Connection object.';
		} else if (error.message === 404) {
			message = 'No session exists';
		}
		if (typeof code !== 'number' || Object.entries(error).length === 0) {
			code = 503;
		}
		res.status(code).send({ message });
	}
});
