import dotenv from 'dotenv';
import chalk from 'chalk';

if (process.env.CALL_CONFIG_DIR) {
	dotenv.config({ path: process.env.CALL_CONFIG_DIR });
} else {
	if (process.env.NODE_ENV === 'development') {
		dotenv.config({ path: '.env.development' });
	} else {
		dotenv.config();
	}
}

// General server configuration
export const SERVER_PORT = process.env.SERVER_PORT || 6080;
export const SERVER_CORS_ORIGIN = process.env.SERVER_CORS_ORIGIN || '*';
export const CALL_NAME_ID = process.env.CALL_NAME_ID || 'openviduCall';
export const CALL_PRIVATE_ACCESS = process.env.CALL_PRIVATE_ACCESS || 'false';
export const CALL_USER = process.env.CALL_USER || 'user';
export const CALL_SECRET = process.env.CALL_SECRET || 'user';
export const CALL_ADMIN_USER = process.env.CALL_ADMIN_USER || 'admin';
export const CALL_ADMIN_SECRET = process.env.CALL_ADMIN_SECRET || 'admin';
export const CALL_PREFERENCES_STORAGE_MODE = process.env.CALL_PREFERENCES_STORAGE_MODE || 's3';
export const CALL_WEBHOOK_ENABLED = process.env.CALL_WEBHOOK_ENABLED || 'false';
export const CALL_WEBHOOK_URL = process.env.CALL_WEBHOOK_URL || 'http://localhost:8080/';

/**
 * Log levels configuration: error, warn, info, verbose, debug, silly
 *
 * The default log level is set to 'verbose' if CALL_LOG_LEVEL environment variable is not defined.
 */
export const CALL_LOG_LEVEL = process.env.CALL_LOG_LEVEL || 'verbose';

// Livekit configuration
export const LIVEKIT_URL = process.env.LIVEKIT_URL || 'ws://localhost:7880';
export const LIVEKIT_URL_PRIVATE = process.env.LIVEKIT_URL_PRIVATE || LIVEKIT_URL;
export const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
export const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';

// S3 configuration
export const CALL_S3_BUCKET = process.env.CALL_S3_BUCKET || 'openvidu';
export const CALL_S3_SERVICE_ENDPOINT = process.env.CALL_S3_SERVICE_ENDPOINT || 'http://localhost:9000';
export const CALL_S3_ACCESS_KEY = process.env.CALL_S3_ACCESS_KEY || 'minioadmin';
export const CALL_S3_SECRET_KEY = process.env.CALL_S3_SECRET_KEY || 'minioadmin';
export const CALL_AWS_REGION = process.env.CALL_AWS_REGION || 'us-east-1';
export const CALL_S3_WITH_PATH_STYLE_ACCESS = process.env.CALL_S3_WITH_PATH_STYLE_ACCESS || 'true';

// Redis configuration
export const REDIS_HOST = process.env.CALL_REDIS_HOST || 'localhost';
export const REDIS_PORT = process.env.CALL_REDIS_PORT || 6379;
export const REDIS_USERNAME = process.env.CALL_REDIS_USERNAME || '';
export const REDIS_PASSWORD = process.env.CALL_REDIS_PASSWORD || 'redispassword';
export const REDIS_DB = process.env.CALL_REDIS_DB || 0;

// Redis configuration Sentinel
export const REDIS_SENTINEL_HOST_LIST = process.env.CALL_REDIS_SENTINEL_HOST_LIST || '';
export const REDIS_SENTINEL_PASSWORD = process.env.CALL_REDIS_SENTINEL_PASSWORD || '';
export const REDIS_SENTINEL_MASTER_NAME = process.env.CALL_REDIS_SENTINEL_MASTER_NAME || 'openvidu';

// Deployment related configuration
export const MODULES_FILE = process.env.MODULES_FILE || undefined;
export const MODULE_NAME = process.env.MODULE_NAME || 'openviduCall';
export const ENABLED_MODULES = process.env.ENABLED_MODULES || '';

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
	console.log('OpenVidu Call Server Configuration');
	console.log('---------------------------------------------------------');
	console.log('SERVICE NAME ID: ', text(CALL_NAME_ID));
	console.log('CORS ORIGIN:', text(SERVER_CORS_ORIGIN));
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
	console.log('CALL PREFERENCES STORAGE:', text(CALL_PREFERENCES_STORAGE_MODE));

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
	console.log('CALL S3 BUCKET:', text(CALL_S3_BUCKET));
	console.log('CALL S3 SERVICE ENDPOINT:', text(CALL_S3_SERVICE_ENDPOINT));
	console.log('CALL S3 ACCESS KEY:', credential('****' + CALL_S3_ACCESS_KEY.slice(-3)));
	console.log('CALL S3 SECRET KEY:', credential('****' + CALL_S3_SECRET_KEY.slice(-3)));
	console.log('CALL AWS REGION:', text(CALL_AWS_REGION));
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
