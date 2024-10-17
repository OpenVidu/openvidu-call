import { Request, Response } from 'express';
import { CALL_PRIVATE_ACCESS } from '../config.js';
import { LoggerService } from '../services/logger.service.js';
import { GlobalPreferences, RoomPreferences } from '../models/global-preferences.model.js';
import { OpenViduCallError } from '../models/error.model.js';

const logger = LoggerService.getInstance();

export const savePreferences = async (req: Request, res: Response) => {
	const preferences: RoomPreferences = req.body;

	if (!preferences) {
		return res.status(400).json({ status: 'error', message: 'No preferences provided' });
	}

	logger.verbose(`Saving preferences ${preferences}`);

	try {
		const roomPreferences: RoomPreferences = {
			recordingEnabled: true,
			broadcastingEnabled: true,
			chatEnabled: true
		};
		const preferences = new GlobalPreferences({ roomPreferences });
		await preferences.save();

		return res.status(200).json({ message: 'Configuration saved successfully.' });
	} catch (error) {
		if (error instanceof OpenViduCallError) {
			logger.error(`Error saving configuration: ${error.message}`);
			return res.status(error.statusCode).json({ name: error.name, message: error.message });
		}

		logger.error(`Unexpected error saving configuration ${error}`);
		return res
			.status(500)
			.json({ name: 'Global Preferences Error', message: 'Unexpected error saving configuration' });
	}
};

export const getGlobalPreferences = async (req: Request, res: Response) => {
	logger.verbose('Getting global preferences');

	try {
		const preferences = await GlobalPreferences.findOne();
		return res.status(200).json(preferences);
	} catch (error) {
		logger.error(`Unexpected error getting global preferences ${error}`);
		return res
			.status(500)
			.json({ name: 'Global Preferences Error', message: 'Unexpected error getting global preferences' });
	}
};

// TODO: Remove this endpoint
export const getConfig = async (req: Request, res: Response) => {
	logger.verbose('Getting config');
	const response = { isPrivateAccess: CALL_PRIVATE_ACCESS === 'true' };
	return res.status(200).json(response);
};
