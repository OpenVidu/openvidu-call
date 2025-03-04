/**
 * Implements storage for preferences using S3.
 * This is used when the application is configured to operate in "s3" mode.
 */

import { GlobalPreferences, OpenViduMeetRoom } from '@typings-ce';
import { PreferencesStorage } from './global-preferences-storage.interface.js';
import { S3Service } from '../s3.service.js';
import { LoggerService } from '../logger.service.js';
import { RedisService } from '../redis.service.js';
import { OpenViduMeetError } from '../../models/error.model.js';
import { inject, injectable } from '../../config/dependency-injector.config.js';

@injectable()
export class S3PreferenceStorage<
	G extends GlobalPreferences = GlobalPreferences,
	R extends OpenViduMeetRoom = OpenViduMeetRoom
> implements PreferencesStorage
{
	protected readonly PREFERENCES_PATH = '.openvidu-meet';
	protected readonly GLOBAL_PREFERENCES_KEY = 'openvidu-meet-preferences';
	constructor(
		@inject(LoggerService) protected logger: LoggerService,
		@inject(S3Service) protected s3Service: S3Service,
		@inject(RedisService) protected redisService: RedisService
	) {}

	async initialize(defaultPreferences: G): Promise<void> {
		const existingPreferences = await this.getGlobalPreferences();

		if (existingPreferences) {
			if (existingPreferences.projectId !== defaultPreferences.projectId) {
				this.logger.warn(
					`Existing preferences are associated with a different project (Project ID: ${existingPreferences.projectId}). Replacing them with the default preferences for the current project.`
				);

				await this.saveGlobalPreferences(defaultPreferences);
			}
		} else {
			this.logger.info('Saving default preferences to S3');
			await this.saveGlobalPreferences(defaultPreferences);
		}
	}

	async getGlobalPreferences(): Promise<G | null> {
		try {
			let preferences: G | null = await this.getFromRedis<G>(this.GLOBAL_PREFERENCES_KEY);

			if (!preferences) {
				// Fallback to fetching from S3 if Redis doesn't have it
				this.logger.debug('Preferences not found in Redis. Fetching from S3...');
				preferences = await this.getFromS3<G>(`${this.PREFERENCES_PATH}/${this.GLOBAL_PREFERENCES_KEY}.json`);

				if (preferences) {
					await this.redisService.set(this.GLOBAL_PREFERENCES_KEY, JSON.stringify(preferences), false);
				}
			}

			return preferences;
		} catch (error) {
			this.handleError(error, 'Error fetching preferences');
			return null;
		}
	}

	async saveGlobalPreferences(preferences: G): Promise<G> {
		try {
			await Promise.all([
				this.s3Service.saveObject(`${this.PREFERENCES_PATH}/${this.GLOBAL_PREFERENCES_KEY}.json`, preferences),
				this.redisService.set(this.GLOBAL_PREFERENCES_KEY, JSON.stringify(preferences), false)
			]);
			return preferences;
		} catch (error) {
			this.handleError(error, 'Error saving preferences');
			throw error;
		}
	}

	async saveOpenViduRoom(ovRoom: R): Promise<R> {
		const { roomName } = ovRoom;

		try {
			await Promise.all([
				this.s3Service.saveObject(`${this.PREFERENCES_PATH}/${roomName}/${roomName}.json`, ovRoom),
				//TODO: Implement ttl for room preferences
				this.redisService.set(roomName, JSON.stringify(ovRoom), false)
			]);
			return ovRoom;
		} catch (error) {
			this.handleError(error, `Error saving Room preferences for room ${roomName}`);
			throw error;
		}
	}

	async getOpenViduRooms(): Promise<R[]> {
		try {
			const content = await this.s3Service.listObjects(this.PREFERENCES_PATH);
			const roomFiles =
				content.Contents?.filter(
					(file) =>
						file?.Key?.endsWith('.json') &&
						file.Key !== `${this.PREFERENCES_PATH}/${this.GLOBAL_PREFERENCES_KEY}.json`
				) ?? [];

			if (roomFiles.length === 0) {
				this.logger.verbose('No OpenVidu rooms found in S3');
				return [];
			}

			// Extract room names from file paths
			const roomNamesList = roomFiles.map((file) => this.extractRoomName(file.Key)).filter(Boolean) as string[];
			// Fetch room preferences in parallel
			const rooms = await Promise.all(
				roomNamesList.map(async (roomName: string) => {
					if (!roomName) return null;

					try {
						return await this.getOpenViduRoom(roomName);
					} catch (error: any) {
						this.logger.warn(`Failed to fetch room "${roomName}": ${error.message}`);
						return null;
					}
				})
			);

			// Filter out null values
			return rooms.filter(Boolean) as R[];
		} catch (error) {
			this.handleError(error, 'Error fetching Room preferences');
			return [];
		}
	}

	/**
	 * Extracts the room name from the given file path.
	 * Assumes the room name is located one directory before the file name.
	 * Example: 'path/to/roomName/file.json' -> 'roomName'
	 * @param filePath - The S3 object key representing the file path.
	 * @returns The extracted room name or null if extraction fails.
	 */
	private extractRoomName(filePath?: string): string | null {
		if (!filePath) return null;

		const parts = filePath.split('/');

		if (parts.length < 2) {
			this.logger.warn(`Invalid room file path: ${filePath}`);
			return null;
		}

		return parts[parts.length - 2];
	}

	async getOpenViduRoom(roomName: string): Promise<R | null> {
		try {
			const room: R | null = await this.getFromRedis<R>(roomName);

			if (!room) {
				this.logger.debug(`Room preferences not found in Redis. Fetching from S3...`);
				return await this.getFromS3<R>(`${this.PREFERENCES_PATH}/${roomName}/${roomName}.json`);
			}

			return room;
		} catch (error) {
			this.handleError(error, `Error fetching Room preferences for room ${roomName}`);
			return null;
		}
	}

	async deleteOpenViduRoom(roomName: string): Promise<void> {
		try {
			await Promise.all([
				this.s3Service.deleteObject(`${this.PREFERENCES_PATH}/${roomName}/${roomName}.json`),
				this.redisService.delete(roomName)
			]);
		} catch (error) {
			this.handleError(error, `Error deleting Room preferences for room ${roomName}`);
		}
	}

	protected async getFromRedis<U>(key: string): Promise<U | null> {
		let response: string | null = null;

		response = await this.redisService.get(key);

		if (response) {
			this.logger.debug(`Object ${key} found in Redis`);
			return JSON.parse(response) as U;
		}

		return null;
	}

	protected async getFromS3<U>(path: string): Promise<U | null> {
		const response = await this.s3Service.getObjectAsJson(path);

		if (response) {
			this.logger.verbose(`Object found in S3 at path: ${path}`);
			return response as U;
		}

		return null;
	}

	protected handleError(error: any, message: string) {
		if (error instanceof OpenViduMeetError) {
			this.logger.error(`${message}: ${error.message}`);
		} else {
			this.logger.error(`${message}: Unexpected error`);
		}
	}
}
