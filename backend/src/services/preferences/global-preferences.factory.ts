/**
 * Factory class to determine and instantiate the appropriate preferences storage
 * mechanism (e.g., Database or S3), based on the configuration of the application.
 */

import { PreferencesStorage } from './global-preferences-storage.interface.js';
import { S3PreferenceStorage } from './s3-preferences-storage.js';
import { MEET_PREFERENCES_STORAGE_MODE } from '../../environment.js';
import { inject, injectable } from '../../config/dependency-injector.config.js';
import { LoggerService } from '../logger.service.js';

@injectable()
export class GlobalPreferencesStorageFactory {
	constructor(
		@inject(S3PreferenceStorage) protected s3PreferenceStorage: S3PreferenceStorage,
		@inject(LoggerService) protected logger: LoggerService
	) {}

	create(): PreferencesStorage {
		const storageMode = MEET_PREFERENCES_STORAGE_MODE;

		switch (storageMode) {
			case 's3':
				return this.s3PreferenceStorage;

			default:
				this.logger.info('No preferences storage mode specified. Defaulting to S3.');
				return this.s3PreferenceStorage;
		}
	}
}
