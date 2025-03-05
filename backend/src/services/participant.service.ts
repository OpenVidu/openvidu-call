import { injectable, inject } from 'inversify';
import { LiveKitService } from './livekit.service.js';
import { LoggerService } from './logger.service.js';
import { ParticipantPermissions, ParticipantRole, TokenOptions } from '@typings-ce';

@injectable()
export class ParticipantService {
	constructor(
		@inject(LoggerService) protected logger: LoggerService,
		@inject(LiveKitService) protected livekitService: LiveKitService
	) {}

	async generateParticipantToken(role: ParticipantRole, options: TokenOptions): Promise<string> {
		const permissions = this.getParticipantPermissions(role, options.roomName);

		return this.livekitService.generateToken(options, permissions, role);
	}

	async deleteParticipant(participantName: string, roomName: string): Promise<void> {
		this.logger.verbose(`Deleting participant ${participantName} from room ${roomName}`);

		return this.livekitService.deleteParticipant(participantName, roomName);
	}

	getParticipantPermissions(role: ParticipantRole, roomName: string): ParticipantPermissions {
		switch (role) {
			case ParticipantRole.MODERATOR:
				return this.generateModeratorPermissions(roomName);
			case ParticipantRole.PUBLISHER:
				return this.generatePublisherPermissions(roomName);
			case ParticipantRole.VIEWER:
				return this.generateViewerPermissions(roomName);
			default:
				throw new Error(`Role ${role} not supported`);
		}
	}

	protected generateModeratorPermissions(roomName: string): ParticipantPermissions {
		return {
			livekit: {
				roomCreate: true,
				roomJoin: true,
				roomList: true,
				roomRecord: true,
				roomAdmin: true,
				room: roomName,
				ingressAdmin: true,
				canPublish: true,
				canSubscribe: true,
				canPublishData: true,
				canUpdateOwnMetadata: true,
				hidden: false,
				recorder: true,
				agent: false
			},
			openvidu: {
				canBroadcast: true,
				canPublishScreen: true,
				canRecord: true,
				canChat: true,
				canChangeVirtualBackground: true
			}
		};
	}

	protected generatePublisherPermissions(roomName: string): ParticipantPermissions {
		return {
			livekit: {
				roomJoin: true,
				roomList: true,
				roomRecord: false,
				roomAdmin: false,
				room: roomName,
				ingressAdmin: false,
				canPublish: true,
				canSubscribe: true,
				canPublishData: true,
				canUpdateOwnMetadata: true,
				hidden: false,
				recorder: false,
				agent: false
			},
			openvidu: {
				canBroadcast: false,
				canPublishScreen: true,
				canRecord: false,
				canChat: true,
				canChangeVirtualBackground: true
			}
		};
	}

	protected generateViewerPermissions(roomName: string): ParticipantPermissions {
		return {
			livekit: {
				roomJoin: true,
				roomList: false,
				roomRecord: false,
				roomAdmin: false,
				room: roomName,
				ingressAdmin: false,
				canPublish: false,
				canSubscribe: true,
				canPublishData: false,
				canUpdateOwnMetadata: false,
				hidden: false,
				recorder: false,
				agent: false
			},
			openvidu: {
				canBroadcast: false,
				canPublishScreen: false,
				canRecord: false,
				canChat: false,
				canChangeVirtualBackground: false
			}
		};
	}
}
