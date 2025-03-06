import { NextFunction, Request, Response } from 'express';
import basicAuth from 'express-basic-auth';
import { TokenService } from '../services/token.service.js';
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

	const tokenService = container.get(TokenService);

	try {
		const payload = await tokenService.verifyToken(token);

		if (payload.sub !== MEET_ADMIN_USER) {
			return res.status(403).json({ message: 'Invalid token subject' });
		}
	} catch (error) {
		return res.status(401).json({ message: 'Invalid token' });
	}

	next();
};

export const withValidApiKey = async (req: Request, res: Response, next: NextFunction) => {
	const apiKey = req.headers['x-api-key'];

	if (!apiKey) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	if (apiKey !== MEET_API_KEY) {
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
