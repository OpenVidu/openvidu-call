import { inject, injectable } from 'inversify';
import { LoggerService } from './logger.service.js';
import { LiveKitService } from './livekit.service.js';
import { RoomService } from './room.service.js';
import { EmbeddedTokenOptions } from '@typings-ce';

@injectable()
export class EmbeddedService {
	constructor(
		@inject(LoggerService) protected logger: LoggerService,
		@inject(LiveKitService) protected livekitService: LiveKitService,
		@inject(RoomService) protected roomService: RoomService
	) {}

	async generateUrl(baseUrl: string, options: EmbeddedTokenOptions): Promise<string> {
		this.logger.info('Generating URL for embedded service');

		const { participantName, roomName } = options;

		this.logger.verbose(`Generating URL for ${participantName} in room ${roomName}`);

		const [token] = await Promise.all([
			this.livekitService.generateToken(options),
			this.roomService.createRoom(roomName)
		]);

		console.log(`${baseUrl}/embedded?token=${token}`);
		return `${baseUrl}/embedded?token=${token}`;
	}
}
