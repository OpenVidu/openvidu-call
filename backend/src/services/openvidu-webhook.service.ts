import { inject, injectable } from '../config/dependency-injector.config.js';
import { Room } from 'livekit-server-sdk';
import { LoggerService } from './logger.service.js';
import { CALL_WEBHOOK_URL } from '../environment.js';
import { OpenViduWebhookEvent } from '../models/webhook.model.js';

@injectable()
export class OpenViduWebhookService {
	constructor(@inject(LoggerService) protected logger: LoggerService) {}

	async sendRoomFinishedWebhook(room: Room): Promise<void> {
		this.logger.verbose(`Sending room finished webhook for room ${room.name}`);

		try {
			await this.fetchWithRetry(CALL_WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					event: OpenViduWebhookEvent.ROOM_FINISHED,
					room: {
						name: room.name
					}
				})
			});
		} catch (error) {
			this.logger.error(`Error sending room finished webhook: ${error}`);
		}
	}

	private async fetchWithRetry(url: string, options: RequestInit, retries = 5, delay = 300): Promise<void> {
		try {
			const response = await fetch(url, options);

			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}
		} catch (error) {
			if (retries <= 0) {
				throw new Error(`Request failed: ${error}`);
			}

			this.logger.verbose(`Retrying in ${delay / 1000} seconds... (${retries} retries left)`);
			await new Promise((resolve) => setTimeout(resolve, delay));
			// Retry the request after a delay with exponential backoff
			return this.fetchWithRetry(url, options, retries - 1, delay * 2);
		}
	}
}
