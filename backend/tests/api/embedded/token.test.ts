import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { Express } from 'express';
import { validateResponse } from '../../utils/openapi-validator';
import { startTestServer, stopTestServer } from '../../utils/server-setup.js';
import { container } from '../../../src/config/dependency-injector.config.js';
import { LiveKitService } from '../../../src/services/livekit.service.js';
import { LoggerService } from '../../../src/services/logger.service.js';

const baseUrl = '/embedded/api/token';
describe('Embedded Auth API Tests', () => {
	let app: Express;

	beforeAll(async () => {
		console.log('Server not started. Running in test mode.');
		app = await startTestServer();
	});

	afterAll(async () => {
		await stopTestServer();
	});

	it('✅ Should generate a token with valid input', async () => {
		console.log;
		const response = await request(app)
			.post(baseUrl)
			.send({
				participantName: 'OpenVidu',
				roomName: 'TestRoom'
			})
			.expect(200);

		expect(response.body).toHaveProperty('token');
		expect(typeof response.body.token).toBe('string');

		// Validate response against OpenAPI spec
		expect(validateResponse(response, baseUrl, 'post')).toBe(true);
	});

	it('❌ Should return 400 when missing participantName', async () => {
		const response = await request(app)
			.post(baseUrl)
			.send({
				roomName: 'TestRoom'
			})
			.expect(400);

		expect(response.body).toHaveProperty('errors');
		expect(response.body.errors[0].message).toContain("must have required property 'participantName'");
		expect(validateResponse(response, baseUrl, 'post')).toBe(true);
	});

	it('❌ Should return 400 when missing roomName', async () => {
		const response = await request(app)
			.post(baseUrl)
			.send({
				participantName: 'OpenVidu'
			})
			.expect(400);

		expect(response.body).toHaveProperty('errors');
		expect(response.body.errors[0].message).toContain("must have required property 'roomName'");
		expect(validateResponse(response, baseUrl, 'post')).toBe(true);
	});

	it('❌ Should return 400 when participantName has wrong type', async () => {
		const response = await request(app)
			.post(baseUrl)
			.send({
				participantName: 22,
				roomName: 'TestRoom'
			})
			.expect(400);

		expect(response.body).toHaveProperty('errors');
		expect(response.body.errors[0].message).toContain('must be string');
		expect(validateResponse(response, baseUrl, 'post')).toBe(true);
	});

	it('❌ Should return 400 when missing both participantName and roomName', async () => {
		const response = await request(app).post(baseUrl).send().expect(415);

		expect(response.body).toHaveProperty('errors');
		expect(response.body.errors[0].message).toContain('unsupported media type');
		expect(validateResponse(response, baseUrl, 'post')).toBe(true);
	});

	it('❌ Should return 500 when an error occurs in generateToken', async () => {
		jest.mock('../../../src/services/livekit.service');
		jest.mock('../../../src/services/logger.service');

		const mockLiveKitService = container.get(LiveKitService);
		mockLiveKitService.generateToken = jest
			.fn()
			.mockRejectedValue(new Error('LiveKit Error') as never) as jest.MockedFunction<
			(options: any) => Promise<string>
		>;
		// Mock the logger service
		const mockLoggerService = container.get(LoggerService);
		mockLoggerService.error = jest.fn();

		const response = await request(app)
			.post(baseUrl)
			.send({
				participantName: 'testParticipant',
				roomName: 'testRoom'
			});

		// Assert: Check that the status is 500 and error message is correct
		expect(response.status).toBe(500);
		expect(response.body.error).toBe('Error generating token');
		expect(mockLoggerService.error).toHaveBeenCalledWith('Error generating token: Error: LiveKit Error');
	});
});
