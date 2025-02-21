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

export const getRooms = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	try {
		logger.verbose('Getting rooms');

		const roomService = container.get(RoomService);
		const rooms = await roomService.getRooms();
		return res.status(200).json(rooms);
	} catch (error) {
		logger.error('Error getting rooms');
		console.error(error);

		res.status(500).json({ name: 'Room Error', message: 'Failed to get rooms' });
	}
};

export const getRoom = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	const { roomId } = req.params;

	try {
		logger.verbose(`Getting room with id '${roomId}'`);

		const roomService = container.get(RoomService);
		const room = await roomService.getRoom(roomId);
		return res.status(200).json(room);
	} catch (error) {
		logger.error(`Error getting room with id '${roomId}'`);
		console.error(error);

		res.status(500).json({ name: 'Room Error', message: 'Failed to get room' });
	}
};

export const deleteRoom = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	const { roomId } = req.params;

	try {
		logger.verbose(`Deleting room with id '${roomId}'`);

		const roomService = container.get(RoomService);
		await roomService.deleteRoom(roomId);
		return res.status(200).json({ message: 'Room deleted' });
	} catch (error) {
		logger.error(`Error deleting room with id '${roomId}'`);
		console.error(error);
		res.status(500).json({ name: 'Room Error', message: 'Failed to delete room' });
	}
};
