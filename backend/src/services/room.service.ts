import { uid } from 'uid/single';
import { uid as secureUid } from 'uid/secure';
import { inject, injectable } from '../config/dependency-injector.config.js';
import { CreateOptions, Room, SendDataOptions } from 'livekit-server-sdk';
import { LoggerService } from './logger.service.js';
import { MEET_NAME_ID } from '../environment.js';
import { LiveKitService } from './livekit.service.js';
import { GlobalPreferencesService } from './preferences/global-preferences.service.js';
import { ParticipantPermissions, OpenViduRoomDAO, OpenViduMeetRoom, OpenViduMeetRoomOptions } from '@typings-ce';
import { OpenViduRoomHelper } from '../helpers/room.helper.js';
import { SystemEventService } from './system-event.service.js';
import { TaskSchedulerService } from './task-scheduler.service.js';

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
		@inject(LiveKitService) protected livekitService: LiveKitService,
		@inject(SystemEventService) protected systemEventService: SystemEventService,
		@inject(TaskSchedulerService) protected taskSchedulerService: TaskSchedulerService
	) {}

	/**
	 * Initializes the room service.
	 *
	 * This method sets up the room garbage collector and event listeners.
	 */
	async initialize(): Promise<void> {
		this.systemEventService.onRedisReady(async () => {
			await this.deleteOpenViduExpiredRooms();
			await Promise.all([
				this.restoreMissingLivekitRooms(),
				this.taskSchedulerService.startRoomGarbageCollector(this.deleteExpiredRooms.bind(this))
			]);
		});
	}

	/**
	 * Creates an OpenVidu room with the specified options.
	 *
	 * @param {string} baseUrl - The base URL for the room.
	 * @param {OpenViduMeetRoomOptions} options - The options for creating the OpenVidu room.
	 * @returns {Promise<OpenViduMeetRoom>} A promise that resolves to the created OpenVidu room.
	 *
	 * @throws {Error} If the room creation fails.
	 *
	 */
	async createRoom(baseUrl: string, roomOptions: OpenViduMeetRoomOptions): Promise<OpenViduMeetRoom> {
		const livekitRoom: Room = await this.createLivekitRoom(roomOptions);

		const openviduRoom: OpenViduMeetRoom = this.generateOpenViduRoom(baseUrl, livekitRoom, roomOptions);

		await this.globalPrefService.saveOpenViduRoom(openviduRoom);

		return openviduRoom;
	}

	/**
	 * Retrieves a list of rooms.
	 * @returns A Promise that resolves to an array of {@link OpenViduMeetRoom} objects.
	 * @throws If there was an error retrieving the rooms.
	 */
	async listOpenViduRooms(): Promise<OpenViduMeetRoom[]> {
		return await this.globalPrefService.getOpenViduRooms();
	}

	/**
	 * Retrieves an OpenVidu room by its name.
	 *
	 * @param roomName - The name of the room to retrieve.
	 * @returns A promise that resolves to an {@link OpenViduMeetRoom} object.
	 */
	async getOpenViduRoom(roomName: string): Promise<OpenViduMeetRoom> {
		return await this.globalPrefService.getOpenViduRoom(roomName);
	}

	/**
	 * Deletes OpenVidu and LiveKit rooms.
	 *
	 * This method deletes rooms from both LiveKit and OpenVidu services.
	 *
	 * @param roomNames - An array of room names to be deleted.
	 * @returns A promise that resolves with an array of successfully deleted room names.
	 */
	async deleteRooms(roomNames: string[]): Promise<string[]> {
		const [openViduResults, livekitResults] = await Promise.all([
			this.deleteOpenViduRooms(roomNames),
			Promise.allSettled(roomNames.map((roomName) => this.livekitService.deleteRoom(roomName)))
		]);

		// Log errors from LiveKit deletions
		livekitResults.forEach((result, index) => {
			if (result.status === 'rejected') {
				this.logger.error(`Failed to delete LiveKit room "${roomNames[index]}": ${result.reason}`);
			}
		});

		// Combine successful deletions
		const successfullyDeleted = new Set(openViduResults);

		livekitResults.forEach((result, index) => {
			if (result.status === 'fulfilled') {
				successfullyDeleted.add(roomNames[index]);
			}
		});

		return Array.from(successfullyDeleted);
	}

	/**
	 * Deletes OpenVidu rooms.
	 *
	 * @param roomNames - List of room names to delete.
	 * @returns A promise that resolves with an array of successfully deleted room names.
	 */
	async deleteOpenViduRooms(roomNames: string[]): Promise<string[]> {
		const results = await Promise.allSettled(
			roomNames.map((roomName) => this.globalPrefService.deleteOpenViduRoom(roomName))
		);

		const successfulRooms: string[] = [];

		results.forEach((result, index) => {
			if (result.status === 'fulfilled') {
				successfulRooms.push(roomNames[index]);
			} else {
				this.logger.error(`Failed to delete OpenVidu room "${roomNames[index]}": ${result.reason}`);
			}
		});

		if (successfulRooms.length === roomNames.length) {
			this.logger.verbose('All OpenVidu rooms have been deleted.');
		}

		return successfulRooms;
	}

	/**
	 * Converts an OpenVidu room or array of rooms to a DAO.
	 *
	 * @param roomOrRooms - The OpenVidu room or array of rooms to convert.
	 * @returns The converted OpenVidu room DAO or array of room DAOs.
	 */
	convertToRoomDAO(roomOrRooms: OpenViduMeetRoom | OpenViduMeetRoom[]): OpenViduRoomDAO | OpenViduRoomDAO[] {
		if (Array.isArray(roomOrRooms)) {
			return roomOrRooms.map(OpenViduRoomHelper.convertToRoomDTO);
		}

		return OpenViduRoomHelper.convertToRoomDTO(roomOrRooms);
	}

	/**
	 * Determines the role of a participant in a room based on the provided secret.
	 *
	 * @param room - The OpenVidu room object.
	 * @param secret - The secret used to identify the participant's role.
	 * @returns The role of the participant ('moderator', 'publisher', or 'viewer').
	 * @throws Will throw an error if the secret is invalid.
	 */
	getParticipantRole(room: OpenViduMeetRoom, secret: string): 'moderator' | 'publisher' | 'viewer' {
		if (room.moderatorRoomUrl.includes(secret)) {
			return 'moderator';
		}

		if (room.publisherRoomUrl.includes(secret)) {
			return 'publisher';
		}

		if (room.viewerRoomUrl.includes(secret)) {
			return 'viewer';
		}

		throw new Error('Invalid secret');
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
	 * Creates a Livekit room with the specified options.
	 *
	 * @param roomOptions - The options for creating the room.
	 * @returns A promise that resolves to the created room.
	 */
	protected async createLivekitRoom(roomOptions: OpenViduMeetRoomOptions): Promise<Room> {
		const livekitRoomOptions: CreateOptions = OpenViduRoomHelper.generateLivekitRoomOptions(roomOptions);

		return await this.livekitService.createRoom(livekitRoomOptions);
	}

	/**
	 * Converts a LiveKit room to an OpenVidu room.
	 *
	 * @param livekitRoom - The LiveKit room object containing metadata, name, and creation time.
	 * @param roomOptions - Options for the OpenVidu room including preferences and end date.
	 * @returns The converted OpenVidu room object.
	 * @throws Will throw an error if metadata is not found in the LiveKit room.
	 */
	protected generateOpenViduRoom(
		baseUrl: string,
		livekitRoom: Room,
		roomOptions: OpenViduMeetRoomOptions
	): OpenViduMeetRoom {
		const { name: roomName, creationTime } = livekitRoom;
		const { preferences, expirationDate, roomNamePrefix, maxParticipants } = roomOptions;

		const openviduRoom: OpenViduMeetRoom = {
			roomName,
			roomNamePrefix,
			creationDate: Number(creationTime) * 1000,
			maxParticipants,
			expirationDate,
			moderatorRoomUrl: `${baseUrl}/${roomName}/?secret=${secureUid(10)}`,
			publisherRoomUrl: `${baseUrl}/${roomName}?secret=${secureUid(10)}`,
			viewerRoomUrl: `${baseUrl}/${roomName}/?secret=${secureUid(10)}`,
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
	 * Deletes OpenVidu expired rooms and consequently LiveKit rooms.
	 *
	 * This method delete the rooms that have an expiration date earlier than the current time.
	 *
	 * @returns {Promise<void>} A promise that resolves when the deletion process is complete.
	 **/
	protected async deleteExpiredRooms(): Promise<void> {
		try {
			const ovExpiredRooms = await this.deleteOpenViduExpiredRooms();

			if (ovExpiredRooms.length === 0) {
				this.logger.verbose('No expired rooms found to delete.');
				return;
			}

			const livekitResults = await Promise.allSettled(
				ovExpiredRooms.map((roomName) => this.livekitService.deleteRoom(roomName))
			);

			const successfulRooms: string[] = [];

			livekitResults.forEach((result, index) => {
				if (result.status === 'fulfilled') {
					successfulRooms.push(ovExpiredRooms[index]);
				} else {
					this.logger.error(`Failed to delete OpenVidu room "${ovExpiredRooms[index]}": ${result.reason}`);
				}
			});

			this.logger.verbose(
				`Successfully deleted ${successfulRooms.length} expired rooms: ${successfulRooms.join(', ')}`
			);
		} catch (error) {
			this.logger.error('Error deleting expired rooms:', error);
		}
	}

	/**
	 * Deletes expired OpenVidu rooms.
	 *
	 * This method checks for rooms that have an expiration date earlier than the current time
	 * and attempts to delete them.
	 *
	 * @returns {Promise<void>} A promise that resolves when the operation is complete.
	 */
	protected async deleteOpenViduExpiredRooms(): Promise<string[]> {
		const now = Date.now();
		this.logger.verbose(`Checking OpenVidu expired rooms at ${new Date(now).toISOString()}`);
		const rooms = await this.listOpenViduRooms();
		const expiredRooms = rooms
			.filter((room) => room.expirationDate && room.expirationDate < now)
			.map((room) => room.roomName);

		if (expiredRooms.length === 0) {
			this.logger.verbose('No OpenVidu expired rooms to delete.');
			return [];
		}

		this.logger.info(`Deleting ${expiredRooms.length} OpenVidu expired rooms: ${expiredRooms.join(', ')}`);

		return await this.deleteOpenViduRooms(expiredRooms);
	}

	/**
	 * Restores missing Livekit rooms by comparing the list of rooms from Livekit and OpenVidu.
	 * If any rooms are missing in Livekit, they will be created.
	 *
	 * @returns {Promise<void>} A promise that resolves when the restoration process is complete.
	 *
	 * @protected
	 */
	protected async restoreMissingLivekitRooms(): Promise<void> {
		this.logger.verbose(`Checking missing Livekit rooms ...`);

		const [lkResult, ovResult] = await Promise.allSettled([
			this.livekitService.listRooms(),
			this.listOpenViduRooms()
		]);

		let lkRooms: Room[] = [];
		let ovRooms: OpenViduMeetRoom[] = [];

		if (lkResult.status === 'fulfilled') {
			lkRooms = lkResult.value;
		} else {
			this.logger.error('Failed to list Livekit rooms:', lkResult.reason);
		}

		if (ovResult.status === 'fulfilled') {
			ovRooms = ovResult.value;
		} else {
			this.logger.error('Failed to list OpenVidu rooms:', ovResult.reason);
		}

		const missingRooms: OpenViduMeetRoom[] = ovRooms.filter(
			(ovRoom) => !lkRooms.some((room) => room.name === ovRoom.roomName)
		);

		if (missingRooms.length === 0) {
			this.logger.verbose('All OpenVidu rooms are present in Livekit. No missing rooms to restore. ');
			return;
		}

		this.logger.info(`Restoring ${missingRooms.length} missing rooms`);

		const creationResults = await Promise.allSettled(
			missingRooms.map((ovRoom) => {
				this.logger.verbose(`Restoring $room: ${ovRoom.roomName}`);
				this.createLivekitRoom(ovRoom);
			})
		);

		creationResults.forEach((result, index) => {
			if (result.status === 'rejected') {
				this.logger.error(`Failed to restore room "${missingRooms[index].roomName}": ${result.reason}`);
			}
		});
	}
}
