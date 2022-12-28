import * as crypto from 'crypto';
import * as express from 'express';
import { Request, Response } from 'express';

import { CALL_ADMIN_SECRET, CALL_OPENVIDU_CERTTYPE } from '../config';
import { AuthService } from '../services/AuthService';
import { OpenViduService } from '../services/OpenViduService';

export const app = express.Router({
	strict: true
});

const cookieAdminMaxAge = 24 * 60 * 60 * 1000; // 24 hours
const openviduService = OpenViduService.getInstance();
const authService = AuthService.getInstance();

app.post('/login', async (req: Request, res: Response) => {
	const { username, password } = req.body;
	req.headers.authorization = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
	const callback = () => {
		console.log('Login succeeded');
		res.status(200).send('');
	};
	return authService.authorizer(req, res, callback);
});

app.post('/admin/login', async (req: Request, res: Response) => {
	const password = req.body.password;
	const adminSessionId = req.cookies[authService.ADMIN_COOKIE_NAME];
	const isAdminSessionValid = authService.isAdminSessionValid(adminSessionId);
	const isAuthValid = password === CALL_ADMIN_SECRET || isAdminSessionValid;
	if (isAuthValid) {
		try {
			if (!isAdminSessionValid) {
				// Generate a new session cookie
				const id = crypto.randomBytes(16).toString('hex');
				res.cookie(authService.ADMIN_COOKIE_NAME, id, {
					maxAge: cookieAdminMaxAge,
					secure: CALL_OPENVIDU_CERTTYPE !== 'selfsigned'
				});
				authService.adminSessions.set(id, { expires: new Date().getTime() + cookieAdminMaxAge });
			}
			const recordings = await openviduService.listAllRecordings();
			console.log(`${recordings.length} recordings found`);
			res.status(200).send(JSON.stringify({ recordings }));
		} catch (error) {
			const code = Number(error?.message);
			if (code === 501) {
				console.log('501. OpenVidu Server recording module is disabled.');
				res.status(200).send();
			} else {
				console.error(error);
				res.status(500).send('Unexpected error getting recordings');
			}
		}
	} else {
		res.status(403).send('Permissions denied');
	}
});

app.post('/admin/logout', async (req: Request, res: Response) => {
	const adminSessionId = req.cookies[authService.ADMIN_COOKIE_NAME];
	authService.adminSessions.delete(adminSessionId);
	res.cookie(authService.ADMIN_COOKIE_NAME, null);
	res.status(200).send("Logout");
	res.end();
});
