import { Injectable } from '@angular/core';
import { RoomPreferences } from '@openvidu/call-common-types';
import { LoggerService } from 'openvidu-components-angular';
import { HttpService } from '../http/http.service';

@Injectable({
	providedIn: 'root'
})
// This service is used to store the global preferences of the application
export class GlobalPreferencesService {
	protected log;
	protected roomPreferences: RoomPreferences | undefined;

	constructor(
		protected loggerService: LoggerService,
		protected httpService: HttpService
	) {
		this.log = this.loggerService.get('OVCall - GlobalPreferencesService');
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
