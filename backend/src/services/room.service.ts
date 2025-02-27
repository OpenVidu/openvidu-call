import { uid } from 'uid/single';
import { uid as secureUid } from 'uid/secure';
import { inject, injectable } from '../config/dependency-injector.config.js';
import { CreateOptions, Room, SendDataOptions } from 'livekit-server-sdk';
import { LoggerService } from './logger.service.js';
import { MEET_NAME_ID } from '../environment.js';
import { LiveKitService } from './livekit.service.js';
import { GlobalPreferencesService } from './preferences/global-preferences.service.js';
import { ParticipantPermissions, OpenViduRoomDAO, OpenViduRoom, OpenViduRoomOptions } from '@typings-ce';
import { CronJob } from 'cron';
import { OpenViduRoomHelper } from '../helpers/room.helper.js';

/**
 * Service for managing OpenVidu Meet rooms.
 *
 * This service provides methods to create, list, retrieve, delete, and send signals to OpenVidu rooms.
 * It uses the LiveKitService to interact with the underlying LiveKit rooms.
 */
@injectable()
export class RoomService {
	constructor(
		@inject(LoggerService) protected logger: LoggerService,
		@inject(GlobalPreferencesService) protected globalPrefService: GlobalPreferencesService,
		@inject(LiveKitService) protected livekitService: LiveKitService
	) {}

	//
	async startRoomGarbageCollector(): Promise<void> {
		try {
			await this.deleteExpiredRooms();
			// Remove expired rooms every day at midnight
			const job = new CronJob('0 0 * * *', async () => {
				try {
					await this.deleteExpiredRooms();
				} catch (error) {
					this.logger.error('Error deleting expired rooms:', error);
				}
			});
			job.start();
		} catch (error) {
			this.logger.error('Error deleting expired rooms:', error);
		}
	}

	/**
	 * Creates an OpenVidu room with the specified options.
	 *
	 * @param {string} baseUrl - The base URL for the room.
	 * @param {OpenViduRoomOptions} options - The options for creating the OpenVidu room.
	 * @returns {Promise<OpenViduRoom>} A promise that resolves to the created OpenVidu room.
	 *
	 * @throws {Error} If the room creation fails.
	 *
	 */
	async createOpenViduRoom(baseUrl: string, roomOptions: OpenViduRoomOptions): Promise<OpenViduRoomDAO> {
		const { roomNamePrefix, expirationDate } = roomOptions;
		const creationDate = Date.now();
		// Calculate the time until the room expires
		const timeUntilExpiration = Math.max(0, Math.floor((expirationDate - creationDate) / 1000));

		const livekitRoomOptions: CreateOptions = {
			name: `${roomNamePrefix}${uid(15)}`,
			metadata: JSON.stringify({
				createdBy: MEET_NAME_ID,
				baseUrl,
				roomOptions
			}),
			// TODO: Add more options
			emptyTimeout: timeUntilExpiration,
			maxParticipants: roomOptions.maxParticipants,
			departureTimeout: 31_536_000 // 1 year in seconds
		};

		const livekitRoom: Room = await this.livekitService.createRoom(livekitRoomOptions);

		const openviduRoom: OpenViduRoom = this.toOpenViduRoom(livekitRoom, roomOptions);

		await this.globalPrefService.saveOpenViduRoom(openviduRoom);

		return OpenViduRoomHelper.toOpenViduRoomDAO(openviduRoom);
	}

	/**
	 * Retrieves a list of rooms.
	 * @returns A Promise that resolves to an array of {@link OpenViduRoom} objects.
	 * @throws If there was an error retrieving the rooms.
	 */
	async listOpenViduRooms(): Promise<OpenViduRoomDAO[]> {
		const rooms = await this.globalPrefService.getOpenViduRooms();
		return rooms.map(OpenViduRoomHelper.toOpenViduRoomDAO);
	}

	/**
	 * Retrieves an OpenVidu room by its name.
	 *
	 * @param roomName - The name of the room to retrieve.
	 * @returns A promise that resolves to an {@link OpenViduRoom} object.
	 */
	async getOpenViduRoom(roomName: string): Promise<OpenViduRoomDAO> {
		const room = await this.globalPrefService.getOpenViduRoom(roomName);
		return OpenViduRoomHelper.toOpenViduRoomDAO(room);
	}

	/**
	 * Deletes an OpenVidu room by its name.
	 *
	 * @param roomName - The name of the room to delete.
	 */
	async deleteOpenViduRoom(roomName: string): Promise<void> {
		await Promise.all([
			this.globalPrefService.deleteOpenViduRoom(roomName),
			this.livekitService.deleteRoom(roomName)
		]);
	}

	/**
	 * Sends a signal to participants in a specified room.
	 *
	 * @param roomName - The name of the room where the signal will be sent.
	 * @param rawData - The raw data to be sent as the signal.
	 * @param options - Options for sending the data, including the topic and destination identities.
	 * @returns A promise that resolves when the signal has been sent.
	 */
	async sendSignal(roomName: string, rawData: any, options: SendDataOptions): Promise<void> {
		this.logger.verbose(
			`Sending signal "${options.topic}" to ${
				options.destinationIdentities ? `participant(s) ${options.destinationIdentities}` : 'all participants'
			} in room "${roomName}".`
		);
		this.livekitService.sendData(roomName, rawData, options);
	}

	/**
	 * Converts a LiveKit room to an OpenVidu room.
	 *
	 * @param livekitRoom - The LiveKit room object containing metadata, name, and creation time.
	 * @param roomOptions - Options for the OpenVidu room including preferences and end date.
	 * @returns The converted OpenVidu room object.
	 * @throws Will throw an error if metadata is not found in the LiveKit room.
	 */
	protected toOpenViduRoom(livekitRoom: Room, roomOptions: OpenViduRoomOptions): OpenViduRoom {
		const { metadata, name: roomName, creationTime, maxParticipants } = livekitRoom;
		const { preferences, expirationDate } = roomOptions;

		if (!metadata) throw new Error('Metadata not found');

		const metadataJson = JSON.parse(metadata);
		const openviduRoom: OpenViduRoom = {
			roomName,
			creationDate: Number(creationTime) * 1000,
			maxParticipants: maxParticipants > 0 ? maxParticipants : undefined,
			expirationDate,
			moderatorRoomUrl: `${metadataJson.baseUrl}/${roomName}/?secret=${secureUid(10)}`,
			publisherRoomUrl: `${metadataJson.baseUrl}/${roomName}?secret=${secureUid(10)}`,
			viewerRoomUrl: `${metadataJson.baseUrl}/${roomName}/?secret=${secureUid(10)}`,
			preferences,
			permissions: {
				moderator: this.generateModeratorPermissions(roomName),
				publisher: this.generatePublisherPermissions(roomName),
				viewer: this.generateViewerPermissions(roomName)
			}
		};
		return openviduRoom;
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

	/**
	 * Deletes rooms that have expired.
	 */
	// TODO: The Op          ion date, so we need to delete them when they expire.
	// The problem is that when Livekit or Redis is down, the empty rooms disappear from the list.
	// We need to check the rooms in Livekit and Redis to see if they are still there.
	// If they are not, we need to check the OpenVidu Rooms and restore them if necessary.
	// We also need to check the expiration date of the rooms and delete them if they have expired.
	protected async deleteExpiredRooms(): Promise<void> {
		try {
			const now = Date.now();
			this.logger.verbose(`Checking expired rooms at ${new Date(now).toISOString()}`);

			// Gett Livekit and OpenVidu rooms
			const [lkRooms, ovRooms] = await Promise.all([this.livekitService.listRooms(), this.listOpenViduRooms()]);

			// Filter out rooms that are not in Livekit
			const roomsToDelete = ovRooms
				.filter((ovRoom) => !lkRooms.some((room) => room.name === ovRoom.roomName))
				.map((ovRoom) => ovRoom.roomName);

			// Filter out expired rooms in OpenVidu
			const expiredRooms = ovRooms
				.filter((room) => room.expirationDate && room.expirationDate < now)
				.map((room) => room.roomName);

			const allRoomsToDelete = [...roomsToDelete, ...expiredRooms];

			if (allRoomsToDelete.length === 0) {
				this.logger.verbose('No expired or missing rooms to delete.');
				return;
			}

			this.logger.info(`Deleting ${allRoomsToDelete.length} rooms: ${allRoomsToDelete.join(', ')}`);

			const deletionResults = await Promise.allSettled(
				allRoomsToDelete.map((roomName) => this.deleteOpenViduRoom(roomName))
			);

			deletionResults.forEach((result, index) => {
				if (result.status === 'rejected') {
					this.logger.error(`Failed to delete room "${allRoomsToDelete[index]}": ${result.reason}`);
				}
			});
		} catch (error) {
			this.logger.error('Error deleting expired rooms:', error);
		}
	}
}
