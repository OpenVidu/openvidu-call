import { container } from '../config/dependency-injector.config.js';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service.js';
import { TokenOptions } from '@typings-ce';
import { LiveKitService } from '../services/livekit.service.js';

export const generateParticipantToken = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	try {
		// TODO: Get token options from role (url configuration)
		const tokenOptions: TokenOptions = req.body;

		const livekitService = container.get(LiveKitService);
		const token = await livekitService.generateToken(tokenOptions);

		return res.status(200).json({token});
	} catch (error) {
		logger.error(`Internal server error: ${error}`);
		return res.status(500).json({ error: 'Internal server error' });
	}
};
