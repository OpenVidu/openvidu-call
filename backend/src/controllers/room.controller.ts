import { container } from '../config/dependency-injector.config.js';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service.js';
import { OpenViduCallError } from '../models/error.model.js';
import { RoomService } from '../services/room.service.js';
import { EmbeddedTokenOptions } from '@typings-ce';
import { OpenViduRoomOptions } from '../typings/ce/room.js';

export const createRoom = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);
	const roomService = container.get(RoomService);
	const options: OpenViduRoomOptions = req.body;

	try {
		logger.verbose(`Creating room with options '${JSON.stringify(options)}'`);
		const baseUrl = `${req.protocol}://${req.get('host')}`;

		const room = await roomService.createOpenViduRoom(baseUrl, options);
		return res.status(200).json(room);
	} catch (error) {
		logger.error(`Error creating room with options '${JSON.stringify(options)}'`);
		handleError(res, error);
	}
};

export const getRooms = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	try {
		logger.verbose('Getting rooms');

		const roomService = container.get(RoomService);
		const rooms = await roomService.listOpenViduRooms();
		return res.status(200).json(rooms);
	} catch (error) {
		logger.error('Error getting rooms');
		handleError(res, error);
	}
};

export const getRoom = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	const { roomId } = req.params;

	try {
		logger.verbose(`Getting room with id '${roomId}'`);

		const roomService = container.get(RoomService);
		const room = await roomService.getOpenViduRoom(roomId);
		return res.status(200).json(room);
	} catch (error) {
		logger.error(`Error getting room with id '${roomId}'`);
		handleError(res, error);
	}
};

export const deleteRoom = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	const { roomId } = req.params;

	try {
		logger.verbose(`Deleting room with id '${roomId}'`);

		const roomService = container.get(RoomService);
		await roomService.deleteOpenViduRoom(roomId);
		logger.info(`Room with id '${roomId}' deleted`);
		return res.status(200).json({ message: 'Room deleted' });
	} catch (error) {
		logger.error(`Error deleting room with id '${roomId}'`);
		handleError(res, error);
	}
};

const handleError = (res: Response, error: OpenViduCallError | unknown) => {
	const logger = container.get(LoggerService);
	logger.error(String(error));

	if (error instanceof OpenViduCallError) {
		res.status(error.statusCode).json({ name: error.name, message: error.message });
	} else {
		res.status(500).json({ name: 'Room Error', message: 'Room operation failed' });
	}
};
