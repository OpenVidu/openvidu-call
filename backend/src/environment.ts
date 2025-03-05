import dotenv from 'dotenv';
import chalk from 'chalk';

const envPath = process.env.MEET_CONFIG_DIR
	? process.env.MEET_CONFIG_DIR
	: process.env.NODE_ENV === 'development'
		? '.env.development'
		: undefined;

dotenv.config(envPath ? { path: envPath } : {});

export const {
	SERVER_PORT = 6080,
	SERVER_CORS_ORIGIN = '*',
	MEET_NAME_ID = 'openviduMeet',
	MEET_API_KEY = 'meet-api-key',
	MEET_PRIVATE_ACCESS = 'false',
	MEET_USER = 'user',
	MEET_SECRET = 'user',
	MEET_ADMIN_USER = 'admin',
	MEET_ADMIN_SECRET = 'admin',
	MEET_ACCESS_TOKEN_EXPIRATION = '1h',
	MEET_REFRESH_TOKEN_EXPIRATION = '1d',
	MEET_PREFERENCES_STORAGE_MODE = 's3',
	MEET_WEBHOOK_ENABLED = 'false',
	MEET_WEBHOOK_URL = 'http://localhost:8080/',
	MEET_LOG_LEVEL = 'verbose',

	// LiveKit configuration
	LIVEKIT_URL = 'ws://localhost:7880',
	LIVEKIT_URL_PRIVATE = LIVEKIT_URL, // Uses LIVEKIT_URL if not explicitly set
	LIVEKIT_API_KEY = 'devkey',
	LIVEKIT_API_SECRET = 'secret',

	// S3 configuration
	MEET_S3_BUCKET = 'openvidu',
	MEET_S3_SERVICE_ENDPOINT = 'http://localhost:9000',
	MEET_S3_ACCESS_KEY = 'minioadmin',
	MEET_S3_SECRET_KEY = 'minioadmin',
	MEET_AWS_REGION = 'us-east-1',
	MEET_S3_WITH_PATH_STYLE_ACCESS = 'true',

	// Redis configuration
	MEET_REDIS_HOST: REDIS_HOST = 'localhost',
	MEET_REDIS_PORT: REDIS_PORT = 6379,
	MEET_REDIS_USERNAME: REDIS_USERNAME = '',
	MEET_REDIS_PASSWORD: REDIS_PASSWORD = 'redispassword',
	MEET_REDIS_DB: REDIS_DB = '0',

	// Redis Sentinel configuration
	MEET_REDIS_SENTINEL_HOST_LIST: REDIS_SENTINEL_HOST_LIST = '',
	MEET_REDIS_SENTINEL_PASSWORD: REDIS_SENTINEL_PASSWORD = '',
	MEET_REDIS_SENTINEL_MASTER_NAME: REDIS_SENTINEL_MASTER_NAME = 'openvidu',

	// Deployment configuration
	MODULES_FILE = undefined,
	MODULE_NAME = 'openviduMeet',
	ENABLED_MODULES = ''
} = process.env;

export const MEET_API_BASE_PATH = '/meet/api';
export const MEET_API_BASE_PATH_V1 = MEET_API_BASE_PATH + '/v1';
export const ACCESS_TOKEN_COOKIE_NAME = 'OvMeetAccessToken';
export const REFRESH_TOKEN_COOKIE_NAME = 'OvMeetRefreshToken';

export function checkModuleEnabled() {
	if (MODULES_FILE) {
		const moduleName = MODULE_NAME;
		const enabledModules = ENABLED_MODULES.split(',').map((module) => module.trim());

		if (!enabledModules.includes(moduleName)) {
			console.error(`Module ${moduleName} is not enabled`);
			process.exit(0);
		}
	}
}

export const logEnvVars = () => {
	const credential = chalk.yellow;
	const text = chalk.cyanBright;
	const enabled = chalk.greenBright;
	const disabled = chalk.redBright;

	console.log(' ');
	console.log('---------------------------------------------------------');
	console.log('OpenVidu Meet Server Configuration');
	console.log('---------------------------------------------------------');
	console.log('SERVICE NAME ID: ', text(MEET_NAME_ID));
	console.log('CORS ORIGIN:', text(SERVER_CORS_ORIGIN));
	console.log('MEET LOG LEVEL: ', text(MEET_LOG_LEVEL));
	console.log('MEET API KEY: ', credential('****' + MEET_API_KEY.slice(-3)));
	console.log(
		'MEET PRIVATE ACCESS: ',
		MEET_PRIVATE_ACCESS === 'true' ? enabled(MEET_PRIVATE_ACCESS) : disabled(MEET_PRIVATE_ACCESS)
	);

	if (MEET_PRIVATE_ACCESS === 'true') {
		console.log('MEET USER: ', credential('****' + MEET_USER.slice(-3)));
		console.log('MEET SECRET: ', credential('****' + MEET_SECRET.slice(-3)));
	}

	console.log('MEET ADMIN USER: ', credential('****' + MEET_ADMIN_USER.slice(-3)));
	console.log('MEET ADMIN PASSWORD: ', credential('****' + MEET_ADMIN_SECRET.slice(-3)));
	console.log('MEET ACCESS TOKEN EXPIRATION: ', text(MEET_ACCESS_TOKEN_EXPIRATION));
	console.log('MEET REFRESH TOKEN EXPIRATION: ', text(MEET_REFRESH_TOKEN_EXPIRATION));
	console.log('MEET PREFERENCES STORAGE:', text(MEET_PREFERENCES_STORAGE_MODE));

	console.log('---------------------------------------------------------');
	console.log('LIVEKIT Configuration');
	console.log('---------------------------------------------------------');
	console.log('LIVEKIT URL: ', text(LIVEKIT_URL));
	console.log('LIVEKIT URL PRIVATE: ', text(LIVEKIT_URL_PRIVATE));
	console.log('LIVEKIT API SECRET: ', credential('****' + LIVEKIT_API_SECRET.slice(-3)));
	console.log('LIVEKIT API KEY: ', credential('****' + LIVEKIT_API_KEY.slice(-3)));
	console.log('---------------------------------------------------------');
	console.log('S3 Configuration');
	console.log('---------------------------------------------------------');
	console.log('MEET S3 BUCKET:', text(MEET_S3_BUCKET));
	console.log('MEET S3 SERVICE ENDPOINT:', text(MEET_S3_SERVICE_ENDPOINT));
	console.log('MEET S3 ACCESS KEY:', credential('****' + MEET_S3_ACCESS_KEY.slice(-3)));
	console.log('MEET S3 SECRET KEY:', credential('****' + MEET_S3_SECRET_KEY.slice(-3)));
	console.log('MEET AWS REGION:', text(MEET_AWS_REGION));
	console.log('---------------------------------------------------------');
	console.log('Redis Configuration');
	console.log('---------------------------------------------------------');
	console.log('REDIS HOST:', text(REDIS_HOST));
	console.log('REDIS PORT:', text(REDIS_PORT));
	console.log('REDIS USERNAME:', credential('****' + REDIS_USERNAME.slice(-3)));
	console.log('REDIS PASSWORD:', credential('****' + REDIS_PASSWORD.slice(-3)));

	if (REDIS_SENTINEL_HOST_LIST !== '') {
		console.log('REDIS SENTINEL IS ENABLED');
		console.log('REDIS SENTINEL HOST LIST:', text(REDIS_SENTINEL_HOST_LIST));
	}

	console.log('---------------------------------------------------------');
	console.log(' ');
};
