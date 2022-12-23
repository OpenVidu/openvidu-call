import { NextFunction, Request, Response } from 'express';
const timingSafeEqual = require('crypto').timingSafeEqual;

import { CALL_PRIVATE_ACCESS, CALL_SECRET, CALL_USER } from '../config';

export class AuthService {
	adminSessions: Map<string, { expires: number }> = new Map();
	ADMIN_COOKIE_NAME = 'ovCallAdminToken';

	protected static instance: AuthService;

	private constructor() {}

	static getInstance() {
		if (!AuthService.instance) {
			AuthService.instance = new AuthService();
		}
		return AuthService.instance;
	}

	authorizer = (req: Request, res: Response, next: NextFunction) => {
		if (CALL_PRIVATE_ACCESS === 'ENABLED') {
			const userAuth = req.headers.authorization;
			const auth = 'Basic ' + Buffer.from(`${CALL_USER}:${CALL_SECRET}`).toString('base64');
			const validAuth = this.safeCompare(userAuth, auth);

			if (validAuth) {
				next();
			} else {
				console.log('Unauthorized');
				return res.status(401).send('Unauthorized');
			}
		} else {
			next();
		}
	};

	isAdminSessionValid(sessionId: string): boolean {
		if(!sessionId) return false;

		const adminCookie = this.adminSessions.get(sessionId);
		return adminCookie?.expires > new Date().getTime();
	}

	private safeCompare(a: string, b: string): boolean {
		if (!!a && !!b) {
			const aLength = Buffer.byteLength(a);
			const bLength = Buffer.byteLength(b);
			const aBuffer = Buffer.alloc(aLength, 0, 'utf8');
			aBuffer.write(a);
			const bBuffer = Buffer.alloc(aLength, 0, 'utf8');
			bBuffer.write(b);
			return !!(timingSafeEqual(aBuffer, bBuffer) && aLength === bLength);
		}
		return false;
	}
}
