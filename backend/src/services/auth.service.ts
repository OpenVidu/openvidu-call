import { Request, Response, NextFunction } from 'express';
import basicAuth from 'express-basic-auth';
import {
	CALL_ADMIN_SECRET,
	CALL_ADMIN_USER,
	CALL_NAME_ID,
	CALL_PRIVATE_ACCESS,
	CALL_SECRET,
	CALL_USER,
	LIVEKIT_API_KEY,
	LIVEKIT_API_SECRET
} from '../config.js';
import { AccessToken, AccessTokenOptions, TokenVerifier } from 'livekit-server-sdk';

// Configure basic auth middleware for user and admin access
export const withAdminAndUserBasicAuth = (req: Request, res: Response, next: NextFunction) => {
	if (CALL_PRIVATE_ACCESS === 'true') {
		// Configure basic auth middleware if access is private
		const basicAuthMiddleware = basicAuth({
			users: {
				[CALL_USER]: CALL_SECRET,
				[CALL_ADMIN_USER]: CALL_ADMIN_SECRET
			},
			challenge: true,
			unauthorizedResponse: () => 'Unauthorized'
		});
		return basicAuthMiddleware(req, res, next);
	} else {
		// Skip basic auth if access is public
		next();
	}
};

// Configure basic auth middleware for admin access
export const withAdminBasicAuth = basicAuth({
	users: {
		[CALL_ADMIN_USER]: CALL_ADMIN_SECRET
	},
	challenge: true,
	unauthorizedResponse: () => 'Unauthorized'
});

// Configure basic auth middleware for user access
export const withUserBasicAuth = (req: Request, res: Response, next: NextFunction) => {
	if (CALL_PRIVATE_ACCESS === 'true') {
		// Configure basic auth middleware if access is private
		const basicAuthMiddleware = basicAuth({
			users: {
				[CALL_USER]: CALL_SECRET
			},
			challenge: true,
			unauthorizedResponse: () => 'Unauthorized'
		});
		return basicAuthMiddleware(req, res, next);
	} else {
		// Skip basic auth if access is public
		next();
	}
};

export class AuthService {
	protected static instance: AuthService;

	private constructor() {}

	static getInstance() {
		if (!AuthService.instance) {
			AuthService.instance = new AuthService();
		}

		return AuthService.instance;
	}

	generateAdminToken() {
		const options: AccessTokenOptions = {
			ttl: '1h',
			metadata: JSON.stringify({
				role: 'admin'
			})
		};
		const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, options);

		return at.toJwt();
	}

	async verifyToken(token: string) {
		const verifyer = new TokenVerifier(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
		return await verifyer.verify(token);
	}

	authenticateUser(username: string, password: string): boolean {
		if (CALL_PRIVATE_ACCESS === 'true') {
			return username === CALL_USER && password === CALL_SECRET;
		}

		return true;
	}

	// TODO: use hash and salt for password storage
	authenticateAdmin(username: string, password: string): boolean {
		return username === CALL_ADMIN_USER && password === CALL_ADMIN_SECRET;
	}

	validateCredentials(username: string, password: string): string[] {
		const errors: string[] = [];

		if (!username || username.length < 4) {
			errors.push('Username must be at least 4 characters long.');
		}

		if (!password || password.length < 4) {
			errors.push('Password must be at least 4 characters long.');
		}

		return errors;
	}
}
