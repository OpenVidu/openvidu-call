import { inject, injectable } from '../config/dependency-injector.config.js';
import {
	AccessToken,
	EgressClient,
	EgressInfo,
	EncodedFileOutput,
	ListEgressOptions,
	ParticipantInfo,
	RoomCompositeOptions,
	RoomServiceClient,
	StreamOutput,
	VideoGrant
} from 'livekit-server-sdk';
import { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL, LIVEKIT_URL_PRIVATE } from '../environment.js';
import { LoggerService } from './logger.service.js';
import { errorLivekitIsNotAvailable, errorParticipantAlreadyExists, internalError } from '../models/error.model.js';
import { EmbeddedTokenOptions } from '@typings-ce';

@injectable()
export class LiveKitService {
	private egressClient: EgressClient;
	private roomClient: RoomServiceClient;

	constructor(@inject(LoggerService) protected logger: LoggerService) {
		const livekitUrlHostname = LIVEKIT_URL_PRIVATE.replace(/^ws:/, 'http:').replace(/^wss:/, 'https:');
		this.egressClient = new EgressClient(livekitUrlHostname, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
		this.roomClient = new RoomServiceClient(livekitUrlHostname, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
	}

	async generateToken(options: EmbeddedTokenOptions): Promise<string> {
		const { roomName, participantName, permissions } = options;

		if (!permissions) {
			options.permissions = {
				canRecord: false,
				canChat: false
			};
		}

		try {
			if (await this.participantAlreadyExists(roomName, participantName)) {
				this.logger.error(`Participant ${participantName} already exists in room ${roomName}`);
				throw errorParticipantAlreadyExists(participantName, roomName);
			}
		} catch (error) {
			this.logger.error(`Error checking participant existence, ${JSON.stringify(error)}`);
			throw error;
		}

		this.logger.info(`Generating token for ${participantName} in room ${roomName}`);

		const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
			identity: participantName,
			name: participantName,
			metadata: JSON.stringify({
				livekitUrl: LIVEKIT_URL,
				permissions: options.permissions
			})
		});
		const lkPermissions: VideoGrant = {
			room: roomName,
			roomCreate: true,
			roomJoin: true,
			roomList: true,
			roomRecord: true,
			roomAdmin: true,
			ingressAdmin: false,
			canPublish: true,
			canSubscribe: true,
			canPublishData: true,
			canUpdateOwnMetadata: false,
			hidden: false,
			recorder: false,
			agent: false
		};
		at.addGrant(lkPermissions);
		return at.toJwt();
	}

	private async participantAlreadyExists(roomName: string, participantName: string): Promise<boolean> {
		try {
			const participants: ParticipantInfo[] = await this.roomClient.listParticipants(roomName);
			return participants.some((participant) => participant.identity === participantName);
		} catch (error: any) {
			this.logger.error(error);

			if (error?.cause?.code === 'ECONNREFUSED') {
				throw errorLivekitIsNotAvailable();
			}

			return false;
		}
	}

	async startRoomComposite(
		roomName: string,
		output: EncodedFileOutput | StreamOutput,
		options: RoomCompositeOptions
	): Promise<EgressInfo> {
		try {
			return await this.egressClient.startRoomCompositeEgress(roomName, output, options);
		} catch (error: any) {
			this.logger.error('Error starting Room Composite Egress');
			throw internalError(`Error starting Room Composite Egress: ${JSON.stringify(error)}`);
		}
	}

	async stopEgress(egressId: string): Promise<EgressInfo> {
		try {
			this.logger.info(`Stopping ${egressId} egress`);
			return await this.egressClient.stopEgress(egressId);
		} catch (error: any) {
			this.logger.error(`Error stopping egress: JSON.stringify(error)`);
			throw internalError(`Error stopping egress: ${error}`);
		}
	}

	async getEgress(options: ListEgressOptions): Promise<EgressInfo[]> {
		try {
			return await this.egressClient.listEgress(options);
		} catch (error: any) {
			this.logger.error(`Error getting egress: ${JSON.stringify(error)}`);
			throw internalError(`Error getting egress: ${error}`);
		}
	}

	isEgressParticipant(participant: ParticipantInfo): boolean {
		return participant.identity.startsWith('EG_') && participant.permission?.recorder === true;
	}
}
