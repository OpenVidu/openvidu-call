import { container } from '../config/dependency-injector.config.js';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service.js';
import { LiveKitService } from '../services/livekit.service.js';
import { EmbeddedTokenOptions } from '@typings-ce';
import { RoomService } from '../services/room.service.js';

export const generateToken = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	try {
		const tokenOptions: EmbeddedTokenOptions = req.body;
		const { participantName, roomName, permissions } = tokenOptions;

		logger.verbose(`Generating token for ${participantName} in room ${roomName}`);
		const livekitService = container.get(LiveKitService);
		const roomService = container.get(RoomService);

		//TODO: Create a new service Embedded service for specific embedded operations
		if (!permissions) {
			tokenOptions.permissions = {
				canRecord: true,
				canChat: true
			};
		}

		const [token] = await Promise.all([
			livekitService.generateToken(tokenOptions),
			roomService.createRoom(roomName)
		]);

		return res.status(200).json({ token });
	} catch (error) {
		logger.error(`Error generating token: ${error}`);
		return res.status(500).json({ error: 'Error generating token' });
	}
};
