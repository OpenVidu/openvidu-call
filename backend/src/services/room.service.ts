import { uid } from 'uid/single';
import { inject, injectable } from '../config/dependency-injector.config.js';
import { CreateOptions, Room, SendDataOptions } from 'livekit-server-sdk';
import { LoggerService } from './logger.service.js';
import { MEET_NAME_ID } from '../environment.js';
import { OpenViduRoom, OpenViduRoomOptions } from '../typings/ce/room.js';
import { LiveKitService } from './livekit.service.js';

/**
 * Service for managing OpenVidu Meet rooms.
 *
 * This service provides methods to create, list, retrieve, delete, and send signals to OpenVidu rooms.
 * It uses the LiveKitService to interact with the underlying LiveKit rooms.
 */
@injectable()
export class RoomService {
	// TODO: REMOVE this and save in mongo
	private roomsMap: Map<string, OpenViduRoom> = new Map();

	constructor(
		@inject(LoggerService) protected logger: LoggerService,
		@inject(LiveKitService) protected livekitService: LiveKitService
	) {}

	/**
	 * Creates a room with the specified options.
	 */
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
	async createOpenViduRoom(baseUrl: string, options: OpenViduRoomOptions): Promise<OpenViduRoom> {
		const { roomNamePrefix, endDate } = options;
		const creationTime = Date.now();
		console.log('Creating room with options:', options);
		const livekitRoomOptions: CreateOptions = {
			name: `${roomNamePrefix}${uid(10)}`,
			metadata: JSON.stringify({
				createdBy: MEET_NAME_ID,
				baseUrl,
				roomOptions: options
			}),
			// TODO: Add more options
			emptyTimeout: 3600 //endDate - creationTime
			// maxParticipants: 4,
			// departureTimeout: 1
		};

		const livekitRoom = await this.livekitService.createRoom(livekitRoomOptions);
		const openviduRoom: OpenViduRoom = this.toOpenViduRoom(livekitRoom);

		//TODO Save it in BBDD
		this.saveRoomData(openviduRoom);

		console.log('Room created:', this.roomsMap);

		return openviduRoom;
	}

	/**
	 * Retrieves a list of rooms.
	 * @returns A Promise that resolves to an array of {@link OpenViduRoom} objects.
	 * @throws If there was an error retrieving the rooms.
	 */
	async listOpenViduRooms(): Promise<OpenViduRoom[]> {
		const livekitRooms = await this.livekitService.listRooms();
		console.log('Rooms:', livekitRooms);
		return livekitRooms.map((livekitRoom) => this.toOpenViduRoom(livekitRoom));
	}

	/**
	 * Retrieves an OpenVidu room by its name.
	 *
	 * @param roomName - The name of the room to retrieve.
	 * @returns A promise that resolves to an {@link OpenViduRoom} object.
	 */
	async getOpenViduRoom(roomName: string): Promise<OpenViduRoom> {
		const livekitRoom = await this.livekitService.getRoom(roomName);
		return this.toOpenViduRoom(livekitRoom);
	}

	/**
	 * Deletes an OpenVidu room by its name.
	 *
	 * This method retrieves the OpenVidu room details and then deletes the room
	 * using the LiveKit service. The details of the deleted room are returned.
	 *
	 * @param roomName - The name of the room to be deleted.
	 * @returns A promise that resolves to the details of the deleted OpenVidu room.
	 */
	async deleteOpenViduRoom(roomName: string): Promise<OpenViduRoom> {
		const openviduRoom = await this.getOpenViduRoom(roomName);
		await this.livekitService.deleteRoom(roomName);
		return openviduRoom;
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

	private saveRoomData(room: OpenViduRoom) {
		const moderatorRoomKey = new URL(room.moderatorRoomUrl).searchParams.get('secret');
		this.roomsMap.set(room.roomId, room);

		if (moderatorRoomKey) this.roomsMap.set(moderatorRoomKey, room);
	}

	/**
	 * Converts a LiveKit room to an OpenVidu room.
	 *
	 * @param livekitRoom - The LiveKit room to be converted.
	 * @returns The converted kOpenVidu room.
	 */
	private toOpenViduRoom(livekitRoom: Room): OpenViduRoom {
		const metadata = livekitRoom.metadata ? JSON.parse(livekitRoom.metadata) : null;
		const roomOptions: OpenViduRoomOptions = metadata.roomOptions;
		const openviduRoom: OpenViduRoom = {
			roomId: livekitRoom.name,
			startDate: Number(livekitRoom.creationTime) * 1000,
			endDate: roomOptions.endDate,
			//TODO: Think the way to do it
			moderatorRoomUrl: `${metadata.baseUrl}/${livekitRoom.name}/?secret=${uid(10)}`,
			publisherRoomUrl: `${metadata.baseUrl}/${livekitRoom.name}?secret=${uid(10)}`,
			viewerRoomUrl: `${metadata.baseUrl}/${livekitRoom.name}/?secret=${uid(10)}`,
		};
		return openviduRoom;
	}
}
