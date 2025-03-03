import { container } from '../config/dependency-injector.config.js';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { LoggerService } from '../services/logger.service.js';
import {
	ACCESS_TOKEN_COOKIE_NAME,
	MEET_ADMIN_USER,
	MEET_API_BASE_PATH_V1,
	REFRESH_TOKEN_COOKIE_NAME
} from '../environment.js';

export const login = (req: Request, res: Response) => {
	const logger = container.get(LoggerService);
	logger.verbose('Login request received');
	const { username, password } = req.body;

	if (!username || !password) {
		logger.warn('Missing username or password');
		return res.status(400).json({ message: 'Missing username or password' });
	}

	const authService = container.get(AuthService);
	const authenticated = authService.authenticateUser(username, password);

	if (!authenticated) {
		logger.warn('Login failed');
		return res.status(401).json({ message: 'Login failed' });
	}

	return res.status(200).json({ message: 'Login succeeded' });
};

export const logout = (req: Request, res: Response) => {
	return res.status(200).json({ message: 'Logout successful' });
};

export const adminLogin = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);
	logger.verbose('Admin login request received');
	const { username, password } = req.body;

	const authService = container.get(AuthService);
	const authenticated = authService.authenticateAdmin(username, password);

	if (!authenticated) {
		logger.warn(`Admin login failed for username: ${username}`);
		return res.status(404).json({ message: 'Admin login failed. Invalid username or password' });
	}

	try {
		const accessToken = authService.generateAccessToken(username);
		const refreshToken = authService.generateRefreshToken(username);
		res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, authService.getAccessTokenCookieOptions());
		res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, authService.getRefreshTokenCookieOptions());
		logger.info(`Admin login succeeded for username: ${username}`);
		return res.status(200).json({ message: 'Admin login succeeded' });
	} catch (error) {
		logger.error('Error generating admin token' + error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

export const adminLogout = (req: Request, res: Response) => {
	res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
	res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
		path: `${MEET_API_BASE_PATH_V1}/auth/admin`
	});
	return res.status(200).json({ message: 'Logout successful' });
};

export const adminRefresh = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);
	logger.verbose('Admin refresh request received');
	const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

	if (!refreshToken) {
		logger.warn('No refresh token provided');
		return res.status(400).json({ message: 'No refresh token provided' });
	}

	const authService = container.get(AuthService);
	const isTokenValid = authService.validateToken(refreshToken, MEET_ADMIN_USER);

	if (!isTokenValid) {
		logger.error('Error validating refresh token');
		return res.status(403).json({ message: 'Invalid refresh token' });
	}

	const accessToken = authService.generateAccessToken(MEET_ADMIN_USER);
	res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, authService.getAccessTokenCookieOptions());
	logger.info(`Admin refresh succeeded for username: ${MEET_ADMIN_USER}`);
	return res.status(200).json({ message: 'Admin refresh succeeded' });
};
