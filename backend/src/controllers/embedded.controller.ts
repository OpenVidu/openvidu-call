import { container } from '../config/dependency-injector.config.js';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service.js';
import { EmbeddedTokenOptions } from '@typings-ce';
import { EmbeddedService } from '../services/embedded.service.js';

export const addParticipant = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	try {
		const tokenOptions: EmbeddedTokenOptions = req.body;

		const embeddedService = container.get(EmbeddedService);

		const baseUrl = `${req.protocol}://${req.get('host')}`;
		const embeddedURL = await embeddedService.generateUrl(baseUrl, tokenOptions);

		return res.status(200).json({ embeddedURL });
	} catch (error) {
		logger.error(`Internal server error: ${error}`);
		return res.status(500).json({ error: 'Internal server error' });
	}
};
