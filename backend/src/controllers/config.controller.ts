import { Request, Response } from 'express';
import { CALL_PRIVATE_ACCESS } from '../config.js';
import { LoggerService } from '../services/logger.service.js';

const logger = LoggerService.getInstance();

export const getConfig = async (req: Request, res: Response) => {
	logger.verbose('Getting config');
	const response = { isPrivate: CALL_PRIVATE_ACCESS === 'true' };
	return res.status(200).json(response);
};
