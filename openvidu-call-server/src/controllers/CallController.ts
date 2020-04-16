
import bunyan from 'bunyan';
import express, { Request, Response } from 'express';
import { OpenViduService } from '../services/OpenViduService';
import { OPENVIDU_URL, OPENVIDU_SECRET } from '../config';
export const app = express.Router({
    strict: true
});
const log = bunyan.createLogger({name: 'CallController'});

const openviduService = new OpenViduService();

app.post('/', async (req: Request, res: Response) => {
	let sessionId: string = req.body.sessionId;
	log.info('Session ID received', req.body);
	try {
		sessionId = (await openviduService.createSession(sessionId, OPENVIDU_URL, OPENVIDU_SECRET)).data;

	} catch (error) {
		const statusCode = error.response.status;
		if (statusCode !== 409)  {
			res.status(statusCode).send('Error creating OpenVidu session');
			return;
		}
	}
	try {
		const token = (await openviduService.createToken(sessionId, OPENVIDU_URL, OPENVIDU_SECRET)).data;
		res.status(200).send(token);
	} catch (error) {
		res.status(error.response.status).send('Error creating OpenVidu token');
	}
});
