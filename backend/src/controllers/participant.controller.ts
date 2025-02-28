import { container } from '../config/dependency-injector.config.js';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service.js';
import { TokenOptions } from '@typings-ce';
import { LiveKitService } from '../services/livekit.service.js';

export const generateParticipantToken = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	try {
		const livekitService = container.get(LiveKitService);
		const tokenOptions: TokenOptions = req.body;

		// TODO: Get the roomName in the request body

		// const roomName = tokenOptions.roomName;

		//TODO Get room preferences of the room
		// const roomPreferences = getRoomPreferences(roomName);

		// TODO Get the participant role from the room url
		// const participantRole = getParticipantRole(roomName, req.body.roomUrl);

		// TODO Get permissions for the participant role
		// const permissions = roomPreferences.permissions[participantRole];

		// TODO generate token with the permissions
		// 		const token = await livekitService.generateToken(tokenOptions, permissions);


		// return res.status(200).json({ token });
	} catch (error) {
		logger.error(`Internal server error: ${error}`);
		return res.status(500).json({ error: 'Internal server error' });
	}
};
