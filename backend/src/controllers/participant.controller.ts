import { container } from '../config/dependency-injector.config.js';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service.js';
import { TokenOptions } from '@typings-ce';
import { LiveKitService } from '../services/livekit.service.js';
import { RoomService } from '../services/room.service.js';

export const generateParticipantToken = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	try {
		const livekitService = container.get(LiveKitService);
		const roomService = container.get(RoomService);

		//TODO use middleware for validation
		const tokenOptions: TokenOptions = req.body;
		const { roomName, secret } = tokenOptions;

		logger.verbose(`Generating participant token for room ${roomName}`);
		const room = await roomService.getOpenViduRoom(roomName);

		const participantRole = roomService.getParticipantRole(room, secret);

		const permissions = room.permissions[participantRole];

		const token = await livekitService.generateToken(tokenOptions, permissions);

		// TODO: Set the participant token in a cookie
		// res.cookie('ovParticipantToken', token, { httpOnly: true, expires: tokenTtl });

		logger.verbose(`Participant token generated for room ${roomName}`);
		return res.status(200).json({ token });
	} catch (error) {
		logger.error(`Internal server error: ${error}`);
		return res.status(500).json({ error: 'Internal server error' });
	}
};
