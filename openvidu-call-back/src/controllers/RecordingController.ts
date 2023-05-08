import { CALL_OPENVIDU_CERTTYPE, CALL_RECORDING, OPENVIDU_URL } from '../config';

import * as express from 'express';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Recording } from 'openvidu-node-client';
import { AuthService } from '../services/AuthService';
import { OpenViduService } from '../services/OpenViduService';
export const app = express.Router({
	strict: true
});

const openviduService = OpenViduService.getInstance();
const authService = AuthService.getInstance();

app.get('/', async (req: Request, res: Response) => {
	try {
		const IS_RECORDING_ENABLED = CALL_RECORDING.toUpperCase() === 'ENABLED';
		const sessionId = openviduService.getSessionIdFromCookie(req.cookies);
		const adminSessionId = req.cookies[authService.ADMIN_COOKIE_NAME];
		const isAdminSessionValid = authService.isAdminSessionValid(adminSessionId);
		const isModeratorSessionValid = openviduService.isModeratorSessionValid(sessionId, req.cookies);
		const isParticipantSessionValid = openviduService.isParticipantSessionValid(sessionId, req.cookies);

		if (!IS_RECORDING_ENABLED) {
			const message = 'Recording is disabled';
			console.error(message);
			return res.status(403).json({ message: 'Recording is disabled' });
		}

		if (isAdminSessionValid) {
			const recordings = await openviduService.listAllRecordings();
			return res.status(200).json(recordings);
		}

		if (Boolean(sessionId) && (isModeratorSessionValid || isParticipantSessionValid)) {
			const date = openviduService.getDateFromCookie(req.cookies);
			const recordings = await openviduService.listRecordingsBySessionIdAndDate(sessionId, date);
			return res.status(200).json(recordings);
		}

		const message = 'Permissions denied to drive recording';
		console.error(message);
		return res.status(403).json({ message });
	} catch (error) {
		console.log(error);
		const code = Number(error?.message);
		let message = 'Unexpected error getting all recordings';
		if (code === 404) {
			message = 'No recording exist for the session';
		}
		return res.status(Number(code) || 500).send(JSON.stringify({ message }));
	}
});

app.post('/start', async (req: Request, res: Response) => {
	try {
		let sessionId: string = req.body.sessionId;

		if (!sessionId) {
			return res.status(400).json({ message: 'Missing session id parameter.' });
		}
		if (CALL_RECORDING !== 'ENABLED') {
			const message = 'OpenVidu Call Recording is disabled';
			console.error(`Start recording failed. ${message}`);
			return res.status(403).json({ message });
		}

		if (!openviduService.isModeratorSessionValid(sessionId, req.cookies)) {
			console.log(`Permissions denied for starting recording in session ${sessionId}`);
			return res.status(403).json({ message: 'Permissions denied to drive recording' });
		}

		console.log(`Starting recording in ${sessionId}`);
		const startingRecording = await openviduService.startRecording(sessionId);
		openviduService.moderatorsCookieMap.get(sessionId).recordingId = startingRecording.id;
		return res.status(200).json(startingRecording);
	} catch (error) {
		console.log(error);
		const code = Number(error?.message);
		let message = `Unexpected error starting recording`;
		if (code === 409) {
			message = 'The session is already being recorded.';
		} else if (code === 501) {
			message = 'OpenVidu Server recording module is disabled';
		} else if (code === 406) {
			message = 'The session has no connected participants';
		}
		return res.status(code || 500).send(JSON.stringify({ message }));
	}
});

app.post('/stop', async (req: Request, res: Response) => {
	try {
		let sessionId: string = req.body.sessionId;
		if (!sessionId) {
			return res.status(400).json({ message: 'Missing session id parameter.' });
		}
		if (CALL_RECORDING !== 'ENABLED') {
			const message = 'OpenVidu Call Recording is disabled';
			console.log(`Stop recording failed. ${message}`);
			return res.status(403).json({ message });
		}

		if (!openviduService.isModeratorSessionValid(sessionId, req.cookies)) {
			console.log(`Permissions denied for stopping recording in session ${sessionId}`);
			return res.status(403).json({ message: 'Permissions denied to drive recording' });
		}

		const recordingId = openviduService.moderatorsCookieMap.get(sessionId)?.recordingId;
		if (!recordingId) {
			return res.status(404).json({ message: 'Session was not being recorded' });
		}

		console.log(`Stopping recording in ${sessionId}`);
		await openviduService.stopRecording(recordingId);
		const date = openviduService.getDateFromCookie(req.cookies);
		const recordingList = await openviduService.listRecordingsBySessionIdAndDate(sessionId, date);
		openviduService.moderatorsCookieMap.get(sessionId).recordingId = '';
		res.status(200).json(recordingList);
	} catch (error) {
		console.log(error);
		const code = Number(error?.message);
		let message = `Unexpected error stopping recording`;
		if (code === 501) {
			message = 'OpenVidu Server recording module is disabled';
		} else if (code === 406) {
			message = 'Recording has STARTING status. Wait until STARTED status before stopping the recording';
		}
		return res.status(code || 500).send(JSON.stringify({ message }));
	}
});

app.delete('/delete/:recordingId', async (req: Request, res: Response) => {
	try {
		const recordingId: string = req.params.recordingId;
		if (!recordingId) {
			return res.status(400).json({ message: 'Missing recording id parameter.' });
		}
		const sessionId = openviduService.getSessionIdFromRecordingId(recordingId);
		const adminSessionId = req.cookies[authService.ADMIN_COOKIE_NAME];
		const isModeratorSessionValid = openviduService.isModeratorSessionValid(sessionId, req.cookies);
		const isAdminSessionValid = authService.isAdminSessionValid(adminSessionId);
		let recordings = [];

		if (!(isModeratorSessionValid || isAdminSessionValid)) {
			return res.status(403).json({ message: 'Permissions denied to drive recording' });
		}

		console.log(`Deleting recording ${recordingId}`);
		await openviduService.deleteRecording(recordingId);
		if (isAdminSessionValid) {
			recordings = await openviduService.listAllRecordings();
		} else {
			const date = openviduService.getDateFromCookie(req.cookies);
			recordings = await openviduService.listRecordingsBySessionIdAndDate(sessionId, date);
		}
		res.status(200).json(recordings);
	} catch (error) {
		console.log(error);
		const code = Number(error?.message);
		let message = `Unexpected error deleting the recording`;
		if (code === 409) {
			message = 'The recording has STARTED status. Stop it before deletion.';
		} else if (code === 501) {
			message = 'OpenVidu Server recording module is disabled';
		} else if (code === 409) {
			message = 'No recording exists for the session';
		}
		return res.status(code).send(JSON.stringify({ message }));
	}
});

export const proxyGETRecording = createProxyMiddleware({
	target: `${OPENVIDU_URL}/openvidu/`,
	secure: CALL_OPENVIDU_CERTTYPE !== 'selfsigned',
	onProxyReq: (proxyReq, req: Request, res: Response) => {
		proxyReq.removeHeader('Cookie');
		const recordingId: string = req.params.recordingId;
		if (!recordingId) {
			return res.status(400).send('Missing recording id parameter.');
		}
		const adminSessionId = req.cookies[authService.ADMIN_COOKIE_NAME];
		const isAdminSessionValid = authService.isAdminSessionValid(adminSessionId);
		const sessionId = openviduService.getSessionIdFromRecordingId(recordingId);
		const isModeratorSessionValid = openviduService.isModeratorSessionValid(sessionId, req.cookies);
		const isParticipantSessionValid = openviduService.isParticipantSessionValid(sessionId, req.cookies);

		if (!!sessionId && (isModeratorSessionValid || isParticipantSessionValid || isAdminSessionValid)) {
			proxyReq.setHeader('Connection', 'keep-alive');
			proxyReq.setHeader('Authorization', openviduService.getBasicAuth());
		} else {
			return res.status(403).send(JSON.stringify({ message: 'Permissions denied to drive recording' }));
		}
	},
	onProxyRes: (proxyRes, req: Request, res: Response) => {
		proxyRes.headers['set-cookie'] = null;
	},
	onError: (error, req: Request, res: Response) => {
		console.log(error);
		const code = Number(error?.message);
		let message = 'Unexpected error downloading the recording';
		if (code === 404) {
			message = 'No recording exist for the session';
		}
		res.status(Number(code) || 500).send(JSON.stringify({ message }));
		return res.end();
	}
});
