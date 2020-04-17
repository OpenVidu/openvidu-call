
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
		const statusCode = error.response?.status;
		if (statusCode && statusCode !== 409)  {
			res.status(statusCode).send('ERROR: Cannot create OpenVidu session');
			return;
		}
		if (error.code === 'ECONNREFUSED'){
			log.error('ERROR: Cannot connect with OpenVidu Server')
			res.status(504).send('ECONNREFUSED: Cannot connect with OpenVidu Server');
			return;
		}
	}
	try {
		const response= (await openviduService.createToken(sessionId, OPENVIDU_URL, OPENVIDU_SECRET)).data;
		res.status(200).send(response);
	} catch (error) {
		log.error('Error creating OpenVidu token')
		res.status(error.response.status).send('Error creating OpenVidu token');
	}
});
