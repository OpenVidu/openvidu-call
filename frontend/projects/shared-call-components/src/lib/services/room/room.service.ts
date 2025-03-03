import { Injectable } from '@angular/core';
import { RoomPreferences } from '@typings-ce';
import { LoggerService } from 'openvidu-components-angular';
import { HttpService } from '../http/http.service';
import { OpenViduMeetRoom, OpenViduMeetRoomOptions } from '@lib/typings/ce/room';

@Injectable({
	providedIn: 'root'
})
export class RoomService {
	protected log;
	protected roomPreferences: RoomPreferences | undefined;
	constructor(
		protected loggerService: LoggerService,
		protected httpService: HttpService
	) {
		this.log = this.loggerService.get('OpenVidu Meet - RoomService');
	}

	async createRoom(): Promise<OpenViduMeetRoom> {
		// TODO: Improve expiration date
		const options: OpenViduMeetRoomOptions = {
			roomNamePrefix: 'TestRoom-',
			expirationDate: Date.now() + 1000 * 60 * 60 // 1 hour from now
		};
		this.log.d('Creating room', options);
		return this.httpService.createRoom(options);
	}

	async deleteRoom(roomName: string) {
		return this.httpService.deleteRoom(roomName);
	}

	async listRooms() {
		return this.httpService.listRooms();
	}

	async getRoom(roomName: string) {
		return this.httpService.getRoom(roomName);
	}

	async getRoomPreferences(): Promise<RoomPreferences> {
		if (!this.roomPreferences) {
			this.log.d('Room preferences not found, fetching from server');
			// Fetch the room preferences from the server
			this.roomPreferences = await this.httpService.getRoomPreferences();
		}

		return this.roomPreferences;
	}

	/**
	 * Saves the room preferences.
	 *
	 * @param {RoomPreferences} preferences - The preferences to be saved.
	 * @returns {Promise<void>} A promise that resolves when the preferences have been saved.
	 */
	async saveRoomPreferences(preferences: RoomPreferences): Promise<void> {
		this.log.d('Saving room preferences', preferences);
		await this.httpService.saveRoomPreferences(preferences);
		this.roomPreferences = preferences;
	}
}
