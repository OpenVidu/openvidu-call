import { Request, Response, NextFunction } from 'express';
import basicAuth from 'express-basic-auth';
import { CALL_ADMIN_SECRET, CALL_ADMIN_USER, CALL_PRIVATE_ACCESS, CALL_SECRET, CALL_USER } from '../config.js';

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

	authenticateUser(username: string, password: string): boolean {
		if (CALL_PRIVATE_ACCESS === 'true') {
			return username === CALL_USER && password === CALL_SECRET;
		}

		return true;
	}

	authenticateAdmin(username: string, password: string): boolean {
		return username === CALL_ADMIN_USER && password === CALL_ADMIN_SECRET;
	}
}
