/**
 * Service that provides high-level methods for managing application preferences,
 * regardless of the underlying storage mechanism.
 */

import { GlobalPreferences, RoomPreferences } from '@typings-ce';
import { LoggerService } from '../logger.service.js';
import { PreferencesStorage } from './global-preferences-storage.interface.js';
import { GlobalPreferencesStorageFactory } from './global-preferences.factory.js';
import { OpenViduCallError } from '../../models/error.model.js';
import { CALL_NAME_ID } from '../../environment.js';
import { injectable, inject } from '../../config/dependency-injector.config.js';

@injectable()
export class GlobalPreferencesService<T extends GlobalPreferences = GlobalPreferences> {
	protected storage: PreferencesStorage;
	constructor(
		@inject(LoggerService) protected logger: LoggerService,
		@inject(GlobalPreferencesStorageFactory) protected storageFactory: GlobalPreferencesStorageFactory
	) {
		this.storage = this.storageFactory.create();
	}

	/**
	 * Initializes default preferences if not already initialized.
	 * @returns {Promise<T>} Default global preferences.
	 */
	async ensurePreferencesInitialized(): Promise<T> {
		const preferences = this.getDefaultPreferences();

		try {
			await this.storage.initialize(preferences);
			return preferences as T;
		} catch (error) {
			this.handleError(error, 'Error initializing default preferences');
			return Promise.resolve({} as T);
		}
	}

	/**
	 * Retrieves the global preferences, initializing them if necessary.
	 * @returns {Promise<GlobalPreferences>}
	 */
	async getGlobalPreferences(): Promise<T> {
		const preferences = await this.storage.getPreferences();

		if (preferences) return preferences as T;

		return await this.ensurePreferencesInitialized();
	}

	/**
	 * Retrieves room preferences from global preferences.
	 * @returns {Promise<RoomPreferences>}
	 */
	async getRoomPreferences(): Promise<RoomPreferences> {
		const preferences = await this.getGlobalPreferences();
		return preferences.roomPreferences;
	}

	/**
	 * Updates room preferences in storage.
	 * @param {RoomPreferences} roomPreferences
	 * @returns {Promise<GlobalPreferences>}
	 */
	async updateRoomPreferences(roomPreferences: RoomPreferences): Promise<T> {
		// TODO: Move validation to the controller layer
		this.validateRoomPreferences(roomPreferences);

		const existingPreferences = await this.getGlobalPreferences();
		existingPreferences.roomPreferences = roomPreferences;
		return this.storage.savePreferences(existingPreferences) as Promise<T>;
	}

	/**
	 * Resets room preferences to default values.
	 * @returns {Promise<T>}
	 */
	async resetRoomPreferences(): Promise<T> {
		const preferences = this.getDefaultPreferences();
		const existingPreferences = await this.getGlobalPreferences();
		existingPreferences.roomPreferences = preferences.roomPreferences;
		return this.storage.savePreferences(existingPreferences) as Promise<T>;
	}

	/**
	 * Validates the room preferences.
	 * @param {RoomPreferences} preferences
	 */
	validateRoomPreferences(preferences: RoomPreferences) {
		const { recordingPreferences, broadcastingPreferences, chatPreferences, virtualBackgroundPreferences } =
			preferences;

		if (!recordingPreferences || !broadcastingPreferences || !chatPreferences || !virtualBackgroundPreferences) {
			throw new Error('All room preferences must be provided');
		}

		if (typeof preferences.recordingPreferences.enabled !== 'boolean') {
			throw new Error('Invalid value for recordingPreferences.enabled');
		}

		if (typeof preferences.broadcastingPreferences.enabled !== 'boolean') {
			throw new Error('Invalid value for broadcastingPreferences.enabled');
		}

		if (typeof preferences.chatPreferences.enabled !== 'boolean') {
			throw new Error('Invalid value for chatPreferences.enabled');
		}

		if (typeof preferences.virtualBackgroundPreferences.enabled !== 'boolean') {
			throw new Error('Invalid value for virtualBackgroundPreferences.enabled');
		}
	}

	/**
	 * Returns the default global preferences.
	 * @returns {GlobalPreferences}
	 */
	protected getDefaultPreferences(): GlobalPreferences {
		return {
			projectId: CALL_NAME_ID,
			roomPreferences: {
				recordingPreferences: { enabled: true },
				broadcastingPreferences: { enabled: true },
				chatPreferences: { enabled: true },
				virtualBackgroundPreferences: { enabled: true }
			}
		};
	}

	/**
	 * Handles errors and logs them.
	 * @param {any} error
	 * @param {string} message
	 */
	protected handleError(error: any, message: string) {
		if (error instanceof OpenViduCallError) {
			this.logger.error(`${message}: ${error.message}`);
		} else {
			this.logger.error(`${message}: Unexpected error`);
		}
	}
}
