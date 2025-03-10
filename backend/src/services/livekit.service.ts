import { inject, injectable } from '../config/dependency-injector.config.js';
import {
	AccessToken,
	CreateOptions,
	DataPacket_Kind,
	EgressClient,
	EgressInfo,
	EncodedFileOutput,
	ListEgressOptions,
	ParticipantInfo,
	Room,
	RoomCompositeOptions,
	RoomServiceClient,
	SendDataOptions,
	StreamOutput
} from 'livekit-server-sdk';
import { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL, LIVEKIT_URL_PRIVATE } from '../environment.js';
import { LoggerService } from './logger.service.js';
import {
	errorLivekitIsNotAvailable,
	errorParticipantAlreadyExists,
	errorParticipantNotFound,
	errorRoomNotFound,
	internalError
} from '../models/error.model.js';
import { ParticipantPermissions, ParticipantRole, TokenOptions } from '@typings-ce';

@injectable()
export class LiveKitService {
	private egressClient: EgressClient;
	private roomClient: RoomServiceClient;

	constructor(@inject(LoggerService) protected logger: LoggerService) {
		const livekitUrlHostname = LIVEKIT_URL_PRIVATE.replace(/^ws:/, 'http:').replace(/^wss:/, 'https:');
		this.egressClient = new EgressClient(livekitUrlHostname, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
		this.roomClient = new RoomServiceClient(livekitUrlHostname, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
	}

	async createRoom(options: CreateOptions): Promise<Room> {
		try {
			return await this.roomClient.createRoom(options);
		} catch (error) {
			this.logger.error('Error creating LiveKit room:', error);
			throw internalError(`Error creating room: ${error}`);
		}
	}

	async getRoom(roomName: string): Promise<Room> {
		let rooms: Room[] = [];

		try {
			rooms = await this.roomClient.listRooms([roomName]);
		} catch (error) {
			this.logger.error(`Error getting room ${error}`);
			throw internalError(`Error getting room: ${error}`);
		}

		if (rooms.length === 0) {
			throw errorRoomNotFound(roomName);
		}

		return rooms[0];
	}

	async listRooms(): Promise<Room[]> {
		try {
			return await this.roomClient.listRooms();
		} catch (error) {
			this.logger.error(`Error getting LiveKit rooms ${error}`);
			throw internalError(`Error getting rooms: ${error}`);
		}
	}

	async deleteRoom(roomName: string): Promise<void> {
		try {
			try {
				await this.getRoom(roomName);
			} catch (error) {
				this.logger.warn(`Livekit Room ${roomName} not found. Skipping deletion.`);
				return;
			}

			await this.roomClient.deleteRoom(roomName);
		} catch (error) {
			this.logger.error(`Error deleting LiveKit room ${error}`);
			throw internalError(`Error deleting room: ${error}`);
		}
	}

	async getParticipant(roomName: string, participantName: string): Promise<ParticipantInfo> {
		try {
			return await this.roomClient.getParticipant(roomName, participantName);
		} catch (error) {
			this.logger.error(`Error getting participant ${error}`);
			throw internalError(`Error getting participant: ${error}`);
		}
	}

	async deleteParticipant(participantName: string, roomName: string): Promise<void> {
		const participantExists = await this.participantExists(roomName, participantName);

		if (!participantExists) {
			throw errorParticipantNotFound(participantName, roomName);
		}

		await this.roomClient.removeParticipant(roomName, participantName);
	}

	async sendData(roomName: string, rawData: Record<string, any>, options: SendDataOptions): Promise<void> {
		try {
			if (this.roomClient) {
				const data: Uint8Array = new TextEncoder().encode(JSON.stringify(rawData));
				await this.roomClient.sendData(roomName, data, DataPacket_Kind.RELIABLE, options);
			} else {
				throw internalError(`No RoomServiceClient available`);
			}
		} catch (error) {
			this.logger.error(`Error sending data ${error}`);
			throw internalError(`Error sending data: ${error}`);
		}
	}

	async generateToken(
		options: TokenOptions,
		permissions: ParticipantPermissions,
		role: ParticipantRole
	): Promise<string> {
		const { roomName, participantName } = options;

		try {
			if (await this.participantExists(roomName, participantName)) {
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
			ttl: '24h',
			metadata: JSON.stringify({
				livekitUrl: LIVEKIT_URL,
				role,
				permissions: permissions.openvidu
			})
		});
		at.addGrant(permissions.livekit);
		return at.toJwt();
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

	private async participantExists(roomName: string, participantName: string): Promise<boolean> {
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
}
