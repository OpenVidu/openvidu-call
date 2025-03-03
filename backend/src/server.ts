import express, { Request, Response, Express } from 'express';
import cors from 'cors';
import chalk from 'chalk';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import { registerDependencies, container } from './config/dependency-injector.config.js';
import {
	SERVER_PORT,
	SERVER_CORS_ORIGIN,
	logEnvVars,
	MEET_API_BASE_PATH_V1,
	MEET_API_BASE_PATH
} from './environment.js';
import { getOpenApiSpecPath, indexHtmlPath, publicFilesPath } from './utils/path-utils.js';
import {
	authRouter,
	broadcastingRouter,
	livekitRouter,
	preferencesRouter,
	recordingRouter,
	roomRouter
} from './routes/index.js';
import { GlobalPreferencesService, RoomService } from './services/index.js';
import { participantsRouter } from './routes/participants.routes.js';
import cookieParser from 'cookie-parser';

const createApp = () => {
	const app: Express = express();
	const openapiSpec = YAML.load(getOpenApiSpecPath());

	// Enable CORS support
	if (SERVER_CORS_ORIGIN) {
		app.use(
			cors({
				origin: SERVER_CORS_ORIGIN,
				credentials: true
			})
		);
	}

	app.use(express.static(publicFilesPath));
	app.use(express.json());
	app.use(cookieParser());

	app.use(`${MEET_API_BASE_PATH_V1}/docs`, swaggerUi.serve, swaggerUi.setup(openapiSpec));
	app.use(`${MEET_API_BASE_PATH_V1}/rooms`, /*mediaTypeValidatorMiddleware,*/ roomRouter);
	app.use(`${MEET_API_BASE_PATH_V1}/recordings`, /*mediaTypeValidatorMiddleware,*/ recordingRouter);
	app.use(`${MEET_API_BASE_PATH_V1}/broadcasts`, /*mediaTypeValidatorMiddleware,*/ broadcastingRouter);
	app.use(`${MEET_API_BASE_PATH_V1}/auth`, /*mediaTypeValidatorMiddleware,*/ authRouter);

	// TODO: This route should be part of the rooms router
	app.use(`${MEET_API_BASE_PATH_V1}/preferences`, /*mediaTypeValidatorMiddleware,*/ preferencesRouter);

	// Internal routes
	app.use(`${MEET_API_BASE_PATH}/participants`, participantsRouter);
	app.use('/meet/health', (_req: Request, res: Response) => res.status(200).send('OK'));

	app.use('/livekit/webhook', livekitRouter);
	app.use('/meet/livekit/webhook', livekitRouter);
	app.get(/^(?!\/api).*$/, (_req: Request, res: Response) => res.sendFile(indexHtmlPath));
	app.use((_req: Request, res: Response) => res.status(404).json({ error: 'Not found' }));

	return app;
};

const initializeGlobalPreferences = async () => {
	const globalPreferencesService = container.get(GlobalPreferencesService);
	await globalPreferencesService.ensurePreferencesInitialized();
};

const startServer = (app: express.Application) => {
	app.listen(SERVER_PORT, async () => {
		console.log(' ');
		console.log('---------------------------------------------------------');
		console.log(' ');
		console.log('OpenVidu Meet is listening on port', chalk.cyanBright(SERVER_PORT));
		console.log('REST API Docs: ', chalk.cyanBright(`http://localhost:${SERVER_PORT}/meet/api/v1/docs`));
		logEnvVars();
		await Promise.all([initializeGlobalPreferences(), container.get(RoomService).initialize()]);
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

export { registerDependencies, createApp, initializeGlobalPreferences };
