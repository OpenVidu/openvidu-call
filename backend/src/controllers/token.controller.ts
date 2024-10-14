// src/controllers/token.controller.ts

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { LoggerService } from '../services/logger.service.js';

const logger = LoggerService.getInstance();

export const generateToken = (req: Request, res: Response) => {
	logger.verbose('Token generation request received');
	const { userId, metadata } = req.body;

	// if (!userId) {
	//     return res.status(400).json({ error: 'User ID is required' });
	// }

	const tokenPayload = { test: 'test' };

	const token = jwt.sign(tokenPayload, 'Config.JWT_SECRET', { expiresIn: '1h' });

	return res.status(200).json({ token });
};
