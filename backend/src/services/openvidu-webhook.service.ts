import crypto from 'crypto';
import { inject, injectable } from '../config/dependency-injector.config.js';
import { Room } from 'livekit-server-sdk';
import { LoggerService } from './logger.service.js';
import { MEET_API_KEY, MEET_WEBHOOK_ENABLED, MEET_WEBHOOK_URL } from '../environment.js';
import { OpenViduWebhookEvent } from '../models/webhook.model.js';

@injectable()
export class OpenViduWebhookService {
	constructor(@inject(LoggerService) protected logger: LoggerService) {}

	async sendRoomFinishedWebhook(room: Room) {
		await this.sendWebhookEvent(OpenViduWebhookEvent.ROOM_FINISHED, {
			room: {
				name: room.name
			}
		});
	}

	private async sendWebhookEvent(eventType: OpenViduWebhookEvent, data: object) {
		if (!this.isWebhookEnabled()) return;

		const payload = {
			event: eventType,
			...data
		};
		const timestamp = Date.now();
		const signature = this.generateWebhookSignature(timestamp, payload);

		this.logger.verbose(`Sending webhook event ${eventType}`);

		try {
			await this.fetchWithRetry(MEET_WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Timestamp': timestamp.toString(),
					'X-Signature': signature
				},
				body: JSON.stringify(payload)
			});
		} catch (error) {
			this.logger.error(`Error sending webhook event ${eventType}: ${error}`);
			throw error;
		}
	}

	private generateWebhookSignature(timestamp: number, payload: object): string {
		return crypto
			.createHmac('sha256', MEET_API_KEY)
			.update(`${timestamp}.${JSON.stringify(payload)}`)
			.digest('hex');
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

	private isWebhookEnabled(): boolean {
		return !!MEET_WEBHOOK_URL && MEET_WEBHOOK_ENABLED === 'true';
	}
}
