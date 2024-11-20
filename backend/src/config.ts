import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
	dotenv.config({ path: 'development.env' });
}

if (process.env.CALL_CONFIG_DIR) {
	dotenv.config({ path: process.env.CALL_CONFIG_DIR });
} else {
	dotenv.config();
}

// General server configuration
export const SERVER_PORT = process.env.SERVER_PORT || 6080;
export const SERVER_CORS_ORIGIN = process.env.SERVER_CORS_ORIGIN || '*';
export const CALL_NAME_ID = process.env.CALL_NAME_ID || 'OpenViduCall';
export const CALL_PRIVATE_ACCESS = process.env.CALL_PRIVATE_ACCESS || 'false';
export const CALL_USER = process.env.CALL_USER || 'user';
export const CALL_SECRET = process.env.CALL_SECRET || 'user';
export const CALL_ADMIN_USER = process.env.CALL_ADMIN_USER || 'admin';
export const CALL_ADMIN_SECRET = process.env.CALL_ADMIN_SECRET || 'admin';

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

/* S3 configuration */
export const CALL_S3_BUCKET = process.env.CALL_S3_BUCKET || 'openvidu';
// Parent directory inside the bucket
export const CALL_S3_PARENT_DIRECTORY = process.env.CALL_S3_PARENT_DIRECTORY || 'openvidu-call';
// Recording directory inside the parent directory
export const CALL_S3_RECORDING_DIRECTORY = process.env.CALL_S3_RECORDING_DIRECTORY || 'recordings';
export const CALL_S3_SERVICE_ENDPOINT = process.env.CALL_S3_SERVICE_ENDPOINT || undefined;
export const CALL_S3_ACCESS_KEY = process.env.CALL_S3_ACCESS_KEY || undefined;
export const CALL_S3_SECRET_KEY = process.env.CALL_S3_SECRET_KEY || undefined;
export const CALL_AWS_REGION = process.env.CALL_AWS_REGION || undefined;
export const CALL_S3_WITH_PATH_STYLE_ACCESS = process.env.CALL_S3_WITH_PATH_STYLE_ACCESS || 'true';

// Deployment related configuration
export const MODULES_FILE = process.env.MODULES_FILE || undefined;
export const MODULE_NAME = process.env.MODULE_NAME || 'app';
export const ENABLED_MODULES = process.env.ENABLED_MODULES || '';
