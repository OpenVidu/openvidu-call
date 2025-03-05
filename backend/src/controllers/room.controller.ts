import { container } from '../config/dependency-injector.config.js';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service.js';
import { OpenViduMeetError } from '../models/error.model.js';
import { RoomService } from '../services/room.service.js';
import { OpenViduMeetRoomOptions } from '@typings-ce';

export const createRoom = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);
	const roomService = container.get(RoomService);
	const options: OpenViduMeetRoomOptions = req.body;

	try {
		logger.verbose(`Creating room with options '${JSON.stringify(options)}'`);
		const baseUrl = `${req.protocol}://${req.get('host')}`;

		const room = await roomService.createRoom(baseUrl, options);
		return res.status(200).json(room);
	} catch (error) {
		logger.error(`Error creating room with options '${JSON.stringify(options)}'`);
		handleError(res, error);
	}
};

export const getRooms = async (_req: Request, res: Response) => {
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

	const { roomName } = req.params;

	try {
		logger.verbose(`Getting room with id '${roomName}'`);

		const roomService = container.get(RoomService);
		const room = await roomService.getOpenViduRoom(roomName);
		return res.status(200).json(room);
	} catch (error) {
		logger.error(`Error getting room with id '${roomName}'`);
		handleError(res, error);
	}
};

export const deleteRooms = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);
	const roomService = container.get(RoomService);

	const { roomName } = req.params;
	const { roomNames } = req.body;

	const roomsToDelete = roomName ? [roomName] : roomNames;

	// TODO: Validate roomNames with ZOD
	if (!Array.isArray(roomsToDelete) || roomsToDelete.length === 0) {
		return res.status(400).json({ error: 'roomNames must be a non-empty array' });
	}

	try {
		logger.verbose(`Deleting rooms: ${roomsToDelete.join(', ')}`);

		await roomService.deleteRooms(roomsToDelete);
		logger.info(`Rooms deleted: ${roomsToDelete.join(', ')}`);
		return res.status(200).json({ message: 'Rooms deleted', deletedRooms: roomsToDelete });
	} catch (error) {
		logger.error(`Error deleting rooms: ${roomsToDelete.join(', ')}`);
		handleError(res, error);
	}
};

export const updateRoomPreferences = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	logger.verbose(`Updating room preferences: ${JSON.stringify(req.body)}`);
	// const { roomName, roomPreferences } = req.body;

	// try {
	// 	const preferenceService = container.get(GlobalPreferencesService);
	// 	preferenceService.validateRoomPreferences(roomPreferences);

	// 	const savedPreferences = await preferenceService.updateOpenViduRoomPreferences(roomName, roomPreferences);

	// 	return res
	// 		.status(200)
	// 		.json({ message: 'Room preferences updated successfully.', preferences: savedPreferences });
	// } catch (error) {
	// 	if (error instanceof OpenViduCallError) {
	// 		logger.error(`Error saving room preferences: ${error.message}`);
	// 		return res.status(error.statusCode).json({ name: error.name, message: error.message });
	// 	}

	// 	logger.error('Error saving room preferences:' + error);
	// 	return res.status(500).json({ message: 'Error saving room preferences', error });
	// }
};

const handleError = (res: Response, error: OpenViduMeetError | unknown) => {
	const logger = container.get(LoggerService);
	logger.error(String(error));

	if (error instanceof OpenViduMeetError) {
		res.status(error.statusCode).json({ name: error.name, message: error.message });
	} else {
		res.status(500).json({ name: 'Room Error', message: 'Internal server error. Room operation failed' });
	}
};
