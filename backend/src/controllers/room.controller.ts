import { container } from '../config/dependency-injector.config.js';
import { Request, Response } from 'express';
import { LiveKitService } from '../services/livekit.service.js';
import { LoggerService } from '../services/logger.service.js';
import { OpenViduCallError } from '../models/error.model.js';
import { RoomService } from '../services/room.service.js';
import { EmbeddedTokenOptions } from '@typings-ce';

export const createRoom = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	const tokenOptions: EmbeddedTokenOptions = req.body;
	const { participantName, roomName } = tokenOptions;

	try {
		if (!roomName) {
			return res.status(400).json({ name: 'Room Error', message: 'Room name is required for this operation' });
		}

		if (!participantName) {
			return res.status(400).json({
				name: 'Room Error',
				message: 'Participant name is required for this operation'
			});
		}

		logger.verbose(`Creating room '${roomName}' with participant '${participantName}'`);

		const livekitService = container.get(LiveKitService);
		const roomService = container.get(RoomService);

		const [token] = await Promise.all([
			livekitService.generateToken(tokenOptions),
			roomService.createRoom(roomName)
		]);
		return res.status(200).json({ token });
	} catch (error) {
		logger.error(`Error creating room '${roomName}' with participant '${participantName}'`);
		console.error(error);

		if (error instanceof OpenViduCallError) {
			res.status(error.statusCode).json({ name: error.name, message: error.message });
		} else {
			res.status(500).json({ name: 'Room Error', message: 'Failed to create room' });
		}
	}
};
