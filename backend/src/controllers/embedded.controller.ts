import { container } from '../config/dependency-injector.config.js';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service.js';
import { LiveKitService } from '../services/livekit.service.js';
import { EmbeddedTokenOptions } from '@typings-ce';

export const generateToken = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	try {
		const tokenOptions: EmbeddedTokenOptions = req.body;
		const { participantName, roomName } = tokenOptions;

		logger.verbose(`Generating token for ${participantName} in room ${roomName}`);
		//TODO: Create a new service Embedded service for specific embedded operations
		const livekitService = container.get(LiveKitService);
		const token = await livekitService.generateToken(tokenOptions);

		return res.status(200).json({ token });
	} catch (error) {
		logger.error(`Error generating token: ${error}`);
		return res.status(500).json({ error: 'Error generating token' });
	}
};
