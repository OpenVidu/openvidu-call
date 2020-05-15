
import * as express from 'express';
import { Request, Response } from 'express';
import { OpenViduService } from '../services/OpenViduService';
import { OPENVIDU_URL, OPENVIDU_SECRET } from '../config';
export const app = express.Router({
    strict: true
});

const openviduService = new OpenViduService();

app.post('/', async (req: Request, res: Response) => {
	let sessionId: string = req.body.sessionId;
	console.log('Session ID received', req.body);
	try {
		const sessionResponse = await openviduService.createSession(sessionId, OPENVIDU_URL, OPENVIDU_SECRET);
		sessionId =sessionResponse.id;
	} catch (error) {
		const statusCode = error.response?.status;
		if (statusCode && statusCode !== 409){
			handleError(error, res);
			return;
		}
	}
	try {
		const response = await openviduService.createToken(sessionId, OPENVIDU_URL, OPENVIDU_SECRET);
		res.status(200).send(JSON.stringify(response.token));
	} catch (error) {
		handleError(error, res);
	}
});

function handleError(error: any, res: Response){
	const statusCode = error.response?.status;
	console.log(error);
	if (error.code === 'ECONNREFUSED'){
		console.error('ERROR: Cannot connect with OpenVidu Server');
		res.status(503).send('ECONNREFUSED: Cannot connect with OpenVidu Server');
		return;
	}
	if(error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' || error.code.includes('SELF_SIGNED_CERT')){
		res.status(401).send('ERROR: Self signed certificate Visit '+ OPENVIDU_URL);
		return;
	}
	res.status(statusCode).send('ERROR: Cannot create OpenVidu session');
}
