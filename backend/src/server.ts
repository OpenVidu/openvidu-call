import { registerDependencies, container } from './config/dependency-injector.config.js';
import express, { Request, Response } from 'express';
import cors from 'cors';
import chalk from 'chalk';
import { indexHtmlPath, publicFilesPath } from './utils/path-utils.js';
import { apiRouter, livekitRouter } from './routes/index.js';
import { SERVER_PORT, SERVER_CORS_ORIGIN, logEnvVars } from './environment.js';
import { embeddedRouter } from './routes/embedded.routes.js';
import { GlobalPreferencesService } from './services/index.js';

const createApp = () => {
	const app = express();

	// Enable CORS support
	if (SERVER_CORS_ORIGIN) {
		app.use(cors({ origin: SERVER_CORS_ORIGIN }));
	}

	app.use(express.static(publicFilesPath));
	app.use(express.json());

	// Setup routes
	app.use('/call/api', apiRouter);
	app.use('/embedded/api', embeddedRouter);
	app.use('/livekit', livekitRouter);
	app.get(/^(?!\/api).*$/, (req: Request, res: Response) => {
		res.sendFile(indexHtmlPath);
	});

	return app;
};

const startServer = (app: express.Application) => {
	app.listen(SERVER_PORT, () => {
		console.log(' ');
		console.log('---------------------------------------------------------');
		console.log(' ');
		console.log('OpenVidu Call Server is listening on port', chalk.cyanBright(SERVER_PORT));
		console.log('REST API Docs: ', chalk.cyanBright(`http://localhost:${SERVER_PORT}/embedded/api/docs`));
		logEnvVars();
		container.resolve(GlobalPreferencesService).ensurePreferencesInitialized();
	});
};

/**
 * Determines if the current module is the main entry point of the application.
 * @returns {boolean} True if this module is the main entry point, false otherwise.
 */
const isMainModule = (): boolean => {
	const importMetaUrl = import.meta.url;
	let processArgv1 = process.argv[1];

	if (process.platform === 'win32') {
		processArgv1 = processArgv1.replace(/\\/g, '/');
		processArgv1 = `file:///${processArgv1}`;
	} else {
		processArgv1 = `file://${processArgv1}`;
	}

	return importMetaUrl === processArgv1;
};

if (isMainModule()) {
	registerDependencies();
	const app = createApp();
	startServer(app);
}
