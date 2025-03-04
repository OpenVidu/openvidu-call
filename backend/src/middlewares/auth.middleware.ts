import { NextFunction, Request, Response } from 'express';
import basicAuth from 'express-basic-auth';

import { AuthService } from '../services/auth.service.js';
import {
	ACCESS_TOKEN_COOKIE_NAME,
	MEET_ADMIN_SECRET,
	MEET_ADMIN_USER,
	MEET_API_KEY,
	MEET_PRIVATE_ACCESS,
	MEET_SECRET,
	MEET_USER
} from '../environment.js';
import { container } from '../config/dependency-injector.config.js';

// Configure token validation middleware for admin access
export const withAdminValidToken = async (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies[ACCESS_TOKEN_COOKIE_NAME];

	if (!token) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const authService = container.get(AuthService);
	const isTokenValid = authService.validateToken(token, MEET_ADMIN_USER);

	if (!isTokenValid) {
		return res.status(401).json({ message: 'Invalid token' });
	}

	next();
};

export const withValidApiKey = async (req: Request, res: Response, next: NextFunction) => {
	const auth = req.headers.authorization;
	console.log('auth', auth);

	if (!auth) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const [authType, apiKey] = auth.split(' ');
	console.log('authType', authType);
	console.log('apiKey', apiKey);

	if (authType !== 'Bearer' || !apiKey || apiKey !== MEET_API_KEY) {
		return res.status(401).json({ message: 'Invalid API key' });
	}

	next();
};

// Configure basic auth middleware for user and admin access
export const withAdminAndUserBasicAuth = (req: Request, res: Response, next: NextFunction) => {
	if (MEET_PRIVATE_ACCESS === 'true') {
		// Configure basic auth middleware if access is private
		const basicAuthMiddleware = basicAuth({
			users: {
				[MEET_USER]: MEET_SECRET,
				[MEET_ADMIN_USER]: MEET_ADMIN_SECRET
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
		[MEET_ADMIN_USER]: MEET_ADMIN_SECRET
	},
	challenge: true,
	unauthorizedResponse: () => 'Unauthorized'
});

// Configure basic auth middleware for user access
export const withUserBasicAuth = (req: Request, res: Response, next: NextFunction) => {
	if (MEET_PRIVATE_ACCESS === 'true') {
		// Configure basic auth middleware if access is private
		const basicAuthMiddleware = basicAuth({
			users: {
				[MEET_USER]: MEET_SECRET
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
