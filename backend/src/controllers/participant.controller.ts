import { container } from '../config/dependency-injector.config.js';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service.js';
import { TokenOptions } from '@typings-ce';
import { OpenViduMeetError } from '../models/index.js';
import { ParticipantService } from '../services/participant.service.js';
import { RoomService } from '../services/room.service.js';

export const generateParticipantToken = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);
	const tokenOptions: TokenOptions = req.body;
	const { roomName, secret, participantName } = tokenOptions;

	try {
		const roomService = container.get(RoomService);
		const participantService = container.get(ParticipantService);

		// Check if participant with same participantName exists in the room
		const participantExists = await participantService.participantExists(roomName, participantName);

		if (participantExists) {
			logger.verbose(`Participant ${participantName} already exists in room ${roomName}`);
			return res.status(409).json({ message: 'Participant already exists' });
		}

		logger.verbose(`Generating participant token for room ${roomName}`);

		const secretRole = await roomService.getRoomSecretRole(roomName, secret);
		const token = await participantService.generateParticipantToken(secretRole, tokenOptions);

		// TODO: Set the participant token in a cookie
		// res.cookie('ovParticipantToken', token, { httpOnly: true, expires: tokenTtl });

		logger.verbose(`Participant token generated for room ${roomName}`);
		return res.status(200).json({ token });
	} catch (error) {
		logger.error(`Error generating participant token for room: ${roomName}`);
		return handleError(res, error);
	}
};

export const deleteParticipant = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);
	const participantService = container.get(ParticipantService);
	const { participantName } = req.params;
	const roomName: string = req.query.roomName as string;

	try {
		await participantService.deleteParticipant(participantName, roomName);
		res.status(200).json({ message: 'Participant deleted' });
	} catch (error) {
		logger.error(`Error deleting participant from room: ${roomName}`);
		return handleError(res, error);
	}
};

const handleError = (res: Response, error: OpenViduMeetError | unknown) => {
	const logger = container.get(LoggerService);
	logger.error(String(error));

	if (error instanceof OpenViduMeetError) {
		res.status(error.statusCode).json({ name: error.name, message: error.message });
	} else {
		res.status(500).json({
			name: 'Participant Error',
			message: 'Internal server error. Participant operation failed'
		});
	}
};
