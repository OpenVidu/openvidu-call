import { CALL_BROADCAST } from '../config';

import * as express from 'express';
import { Request, Response } from 'express';
import { OpenViduService } from '../services/OpenViduService';
export const app = express.Router({
	strict: true
});

const openviduService = OpenViduService.getInstance();

app.post('/start', async (req: Request, res: Response) => {
	try {
		const IS_BROADCASTING_ENABLED = CALL_BROADCAST.toUpperCase() === 'ENABLED';

		if (IS_BROADCASTING_ENABLED) {
			const sessionId = openviduService.getSessionIdFromCookie(req?.cookies);
			if (!!sessionId && openviduService.isValidToken(sessionId, req.cookies)) {
				console.log(`Starting broadcast in ${sessionId}`);

				const broadcastUrl: string = req.body.broadcastUrl;
				const isCE = openviduService.isCE();

				if (isCE) {
					return res
						.status(400)
						.send(JSON.stringify({ broadcastAvailable: false, message: 'Broadcast is not available on OpenVidu CE.' }));
				}
				await openviduService.startBroadcasting(sessionId, broadcastUrl);
				return res.status(200).send({ broadcastAvailable: true, message: 'Broadcasting started' });
			} else {
				console.log(`Permissions denied for starting broadcast in session ${sessionId}`);
				res.status(403).send(JSON.stringify({ message: 'Permissions denied to drive broadcast' }));
			}
		} else {
			console.log(`Start broadcast failed. OpenVidu Call Broadcasting is disabled`);
			res.status(403).send(JSON.stringify({ message: 'OpenVidu Call Broadcasting is disabled' }));
		}
	} catch (error) {
		console.log(error);
		const code = Number(error?.message);
		let message = `Unexpected error starting broadcast`;
		if (code === 409) {
			message = 'The session is already being streamed.';
		} else if (code === 404) {
			message = 'Session not found';
		} else if (code === 400) {
			message = 'Url is not valid';
		} else if (code === 406) {
			message = 'Session is not active';
		} else if (code === 501) {
			message = 'OpenVidu Server broadcast module is disabled';
		}

		return res.status(code || 500).send(JSON.stringify({ message }));
	}
});

app.delete('/stop', async (req: Request, res: Response) => {
	try {
		const IS_BROADCASTING_ENABLED = CALL_BROADCAST.toUpperCase() === 'ENABLED';

		if (IS_BROADCASTING_ENABLED) {
			const sessionId = openviduService.getSessionIdFromCookie(req?.cookies);
			if (!!sessionId && openviduService.isValidToken(sessionId, req.cookies)) {
				console.log(`Stopping broadcast in ${sessionId}`);
				await openviduService.stopBroadcasting(sessionId);
				res.status(200).send({ message: 'Broadcasting stopped' });
			} else {
				console.log(`Permissions denied for stopping broadcast in session ${sessionId}`);
				res.status(403).send(JSON.stringify({ message: 'Permissions denied to drive broadcast' }));
			}
		} else {
			console.log(`Stop broadcast failed. OpenVidu Call Broadcasting is disabled`);
			res.status(403).send(JSON.stringify({ message: 'OpenVidu Call Broadcasting is disabled' }));
		}
	} catch (error) {
		console.log(error);
		const code = Number(error?.message);
		let message = `Unexpected error starting broadcast`;
		if (code === 409) {
			message = 'The session is not being streamed.';
		} else if (code === 404) {
			message = 'Session not found';
		} else if (code === 501) {
			message = 'OpenVidu Server broadcast module is disabled';
		}

		return res.status(code || 500).send(JSON.stringify({ message }));
	}
});
