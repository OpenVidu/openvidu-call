/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApp, registerDependencies, initializeGlobalPreferences } from '../../src/server.js';
import request from 'supertest';
import { Express } from 'express';

import { SERVER_PORT } from '../../src/environment.js';
import { Server } from 'http';

let server: Server
const baseUrl = '/meet/health';

export const startTestServer = async (): Promise<Express> => {
	registerDependencies();
	const app = createApp();

	return await new Promise<Express>((resolve, reject) => {
		server = app.listen(SERVER_PORT, async () => {
			try {
				// Initialize global preferences once the server is ready
				await initializeGlobalPreferences();

				// Check if the server is responding by hitting the health check route
				const response = await request(app).get(baseUrl);

				if (response.status === 200) {
					console.log('Test server started and healthy!');
					resolve(app);
				} else {
					reject(new Error('Test server not healthy'));
				}
			} catch (error: any) {
				reject(new Error('Failed to initialize server or global preferences: ' + error.message));
			}
		});

		// Handle server errors
		server.on('error', (error: any) => reject(new Error(`Test server startup error: ${error.message}`)));
	});
};

/**
 * Stops the test server.
 * It will call `server.close()` to gracefully shut down the server.
 */
export const stopTestServer = async (): Promise<void> => {
	if (server) {
		return new Promise<void>((resolve, reject) => {
			server.close((err) => {
				if (err) {
					reject(new Error(`Failed to stop server: ${err.message}`));
				} else {
					console.log('Test server stopped.');
					resolve();
				}
			});
		});
	} else {
		console.log('Server is not running.');
	}
};
