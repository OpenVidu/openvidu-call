import dotenv from 'dotenv';
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
	CALL_AWS_S3_BUCKET,
	CALL_AWS_S3_SERVICE_ENDPOINT,
	CALL_AWS_ACCESS_KEY,
	CALL_AWS_SECRET_KEY
} from './config.js';

dotenv.config();
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
	console.log(
		'CALL PRIVATE ACCESS: ',
		CALL_PRIVATE_ACCESS === 'true' ? enabled(CALL_PRIVATE_ACCESS) : disabled(CALL_PRIVATE_ACCESS)
	);

	if (CALL_PRIVATE_ACCESS === 'true') {
		console.log('CALL USER: ', credential('****' + CALL_USER.slice(-3)));
		console.log('CALL SECRET: ', credential('****' + CALL_SECRET.slice(-3)));
	}

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
	console.log('CALL_AWS_S3_BUCKET:', text(CALL_AWS_S3_BUCKET));
	console.log('CALL_AWS_S3_SERVICE_ENDPOINT:', text(CALL_AWS_S3_SERVICE_ENDPOINT));
	console.log('CALL_AWS_ACCESS_KEY:', credential('****' + CALL_AWS_ACCESS_KEY.slice(-3)));
	console.log('CALL_AWS_SECRET_KEY:', credential('****' + CALL_AWS_SECRET_KEY.slice(-3)));
	console.log('---------------------------------------------------------');});

export default app;
