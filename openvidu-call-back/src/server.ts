import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter, livekitRouter } from './routes.js';
import chalk from 'chalk';
import {
	LIVEKIT_URL,
	LIVEKIT_API_KEY,
	LIVEKIT_API_SECRET,
	SERVER_PORT,
	CALL_PRIVATE_ACCESS,
	CALL_SECRET,
	CALL_USER,
	CALL_ADMIN_SECRET,
	LIVEKIT_URL_PRIVATE,
	CALL_S3_BUCKET,
	CALL_S3_SERVICE_ENDPOINT,
	CALL_S3_ACCESS_KEY,
	CALL_S3_SECRET_KEY,
	CALL_ADMIN_USER,
	CALL_AWS_REGION,
	CALL_LOG_LEVEL,
	CALL_NAME_ID
} from './config.js';

const app = express();

// Enable CORS support
if (process.env.TESTING_MODE === 'ENABLED') {
	console.log('CORS enabled');
	app.use(
		cors({
			origin: '*'
		})
	);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname + '/public/browser'));
app.use(express.json());

app.use('/call/api', apiRouter);
app.use(`/livekit`, livekitRouter);
app.get(/^(?!\/api).*$/, (req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, 'public/browser', 'index.html'));
});

app.listen(SERVER_PORT, () => {
	const credential = chalk.yellow;
	const text = chalk.cyanBright;
	const enabled = chalk.greenBright;
	const disabled = chalk.redBright;

	console.log(' ');
	console.log('---------------------------------------------------------');
	console.log(' ');
	console.log('OpenVidu Call Server is listening on port', text(SERVER_PORT));
	console.log(' ');
	console.log('---------------------------------------------------------');
	console.log(' OpenVidu Call Configuration');
	console.log('---------------------------------------------------------');
	console.log('SERVICE NAME ID: ', text(CALL_NAME_ID));
	console.log('CALL LOG LEVEL: ', text(CALL_LOG_LEVEL));
	console.log(
		'CALL PRIVATE ACCESS: ',
		CALL_PRIVATE_ACCESS === 'true' ? enabled(CALL_PRIVATE_ACCESS) : disabled(CALL_PRIVATE_ACCESS)
	);

	if (CALL_PRIVATE_ACCESS === 'true') {
		console.log('CALL USER: ', credential('****' + CALL_USER.slice(-3)));
		console.log('CALL SECRET: ', credential('****' + CALL_SECRET.slice(-3)));
	}

	console.log('CALL ADMIN USER: ', credential('****' + CALL_ADMIN_USER.slice(-3)));
	console.log('CALL ADMIN PASSWORD: ', credential('****' + CALL_ADMIN_SECRET.slice(-3)));
	console.log('---------------------------------------------------------');
	console.log(' LIVEKIT Configuration');
	console.log('---------------------------------------------------------');
	console.log('LIVEKIT URL: ', text(LIVEKIT_URL));
	console.log('LIVEKIT URL PRIVATE: ', text(LIVEKIT_URL_PRIVATE));
	console.log('LIVEKIT API SECRET: ', credential('****' + LIVEKIT_API_SECRET.slice(-3)));
	console.log('LIVEKIT API KEY: ', credential('****' + LIVEKIT_API_KEY.slice(-3)));
	console.log('---------------------------------------------------------');
	console.log(' S3 Configuration');
	console.log('---------------------------------------------------------');
	console.log('CALL S3 BUCKET:', text(CALL_S3_BUCKET));
	console.log('CALL S3 SERVICE ENDPOINT:', text(CALL_S3_SERVICE_ENDPOINT));
	console.log('CALL S3 ACCESS KEY:', credential('****' + CALL_S3_ACCESS_KEY.slice(-3)));
	console.log('CALL S3 SECRET KEY:', credential('****' + CALL_S3_SECRET_KEY.slice(-3)));
	console.log('CALL AWS REGION:', text(CALL_AWS_REGION));
	console.log('---------------------------------------------------------');});

export default app;
