import fetchMock from 'jest-fetch-mock';
import { OpenViduWebhookService } from '../../src/services/openvidu-webhook.service';
import { LoggerService } from '../../src/services/logger.service';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

import { Room } from 'livekit-server-sdk';
import { OpenViduWebhookEvent } from '../../src/models/webhook.model';
import { MEET_WEBHOOK_URL } from '../../src/environment';

describe('OpenVidu Webhook Service', () => {
	let webhookService: OpenViduWebhookService;
	let loggerMock: jest.Mocked<LoggerService>;

	beforeEach(() => {
		fetchMock.enableMocks();

		// Create a new instance of LoggerService before each test
		loggerMock = {
			verbose: jest.fn(),
			error: jest.fn()
		} as unknown as jest.Mocked<LoggerService>;

		// Create a new instance of OpenViduWebhookService before each test
		webhookService = new OpenViduWebhookService(loggerMock);
	});

	afterEach(() => {
		jest.clearAllMocks();
		fetchMock.resetMocks();
		jest.useRealTimers();
	});

	it('should not send webhook if webhook is disabled', async () => {
		jest.spyOn(webhookService as any, 'isWebhookEnabled').mockReturnValue(false);

		const mockRoom = { name: 'TestRoom' } as Room;

		await webhookService.sendRoomFinishedWebhook(mockRoom);

		expect(fetch).not.toHaveBeenCalled();
		expect(loggerMock.verbose).not.toHaveBeenCalled();
	});

	it('should send webhook when enabled and request is successful', async () => {
		jest.spyOn(webhookService as any, 'isWebhookEnabled').mockReturnValue(true);

		(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(new Response(null, { status: 200 }));

		const mockRoom = { name: 'TestRoom' } as Room;

		await webhookService.sendRoomFinishedWebhook(mockRoom);

		expect(loggerMock.verbose).toHaveBeenCalledWith(`Sending room finished webhook for room ${mockRoom.name}`);

		expect(fetch).toHaveBeenCalledWith(MEET_WEBHOOK_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				event: OpenViduWebhookEvent.ROOM_FINISHED,
				room: { name: mockRoom.name }
			})
		});
	});

	it('should retry sending webhook on failure and eventually succeed', async () => {
		jest.spyOn(webhookService as any, 'isWebhookEnabled').mockReturnValue(true);

		// Set fetch to fail twice before succeeding
		(fetch as jest.MockedFunction<typeof fetch>)
			.mockRejectedValueOnce(new Error('Network Error'))
			.mockRejectedValueOnce(new Error('Network Error'))
			.mockResolvedValue(new Response(null, { status: 200 }));

		const mockRoom = { name: 'TestRoom' } as Room;

		await webhookService.sendRoomFinishedWebhook(mockRoom);

		expect(loggerMock.verbose).toHaveBeenCalledWith(`Sending room finished webhook for room ${mockRoom.name}`);

		expect(loggerMock.verbose).toHaveBeenCalledWith('Retrying in 0.3 seconds... (5 retries left)');
		expect(loggerMock.verbose).toHaveBeenCalledWith('Retrying in 0.6 seconds... (4 retries left)');

		expect(fetch).toHaveBeenCalledTimes(3);
	});

	it('should throw error after exhausting all retries', async () => {
		jest.useFakeTimers({ advanceTimers: true });
		jest.spyOn(webhookService as any, 'isWebhookEnabled').mockReturnValue(true);

		// Set fetch to always fail
		(fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network Error'));

		const mockRoom = { name: 'TestRoom' } as Room;

		const sendPromise = webhookService.sendRoomFinishedWebhook(mockRoom);

		for (const delay of [300, 600, 1200, 2400, 4800]) {
			jest.advanceTimersByTime(delay);
			await new Promise(process.nextTick);
		}

		await expect(sendPromise).rejects.toThrow('Request failed: Error: Network Error');

		jest.useRealTimers();

		expect(fetch).toHaveBeenCalledTimes(6);
	});
});
