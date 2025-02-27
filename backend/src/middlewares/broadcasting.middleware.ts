import { container } from '../config/dependency-injector.config.js';
import { Request, Response, NextFunction } from 'express';
import { GlobalPreferencesService } from '../services/preferences/index.js';
import { RoomPreferences } from '@typings-ce';
import { LoggerService } from '../services/logger.service.js';

export const withBroadcastingEnabled = async (req: Request, res: Response, next: NextFunction) => {
	const logger = container.get(LoggerService);

	try {
		// TODO: Think how get the roomName from the request

		return next();

		// const preferenceService = container.get(GlobalPreferencesService);

		// const preferences: RoomPreferences | null = await preferenceService.getOpenViduRoomPreferences(roomName);

		// if (preferences) {
		// 	const { broadcastingPreferences } = preferences;

		// 	if (!broadcastingPreferences.enabled) {
		// 		return res.status(403).json({ message: 'Broadcasting is disabled in this room.' });
		// 	}

		// 	return next();
		// }

		// logger.error('No room preferences found checking broadcasting preferences. Refusing access.');
		// return res.status(403).json({ message: 'Broadcasting is disabled in this room.' });
	} catch (error) {
		logger.error('Error checking broadcasting preferences:' + error);
		return res.status(403).json({ message: 'Broadcasting is disabled in this room.' });
	}
};
