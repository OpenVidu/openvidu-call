import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service.js';
import { LiveKitService } from '../services/livekit.service.js';

const logger = LoggerService.getInstance();
const livekitService = LiveKitService.getInstance();

export const generateToken = async (req: Request, res: Response) => {
	const { roomName, participantName } = req.body;
	logger.verbose(`Token generation request received: ${JSON.stringify(req.body)}`);

	if (!participantName || !roomName) {
		logger.error('Parameters participantName and roomName are required');
		return res.status(400).json({ error: 'Parameters participantName and roomName are required' });
	}

	logger.verbose(`Generating token for ${participantName} in room ${roomName}`);

	try {
		const token = await livekitService.generateToken(roomName, participantName);

		return res.status(200).json({ token });
	} catch (error) {
		logger.error(`Error generating token: ${error}`);
		return res.status(500).json({ error: 'Error generating token' });
	}
};
