import { injectable } from '../config/dependency-injector.config.js';
import * as config from '../environment.js';
import { Redis, RedisOptions, SentinelAddress } from 'ioredis';
import {
	REDIS_DB,
	REDIS_HOST,
	REDIS_PASSWORD,
	REDIS_PORT,
	REDIS_SENTINEL_MASTER_NAME,
	REDIS_SENTINEL_HOST_LIST,
	REDIS_SENTINEL_PASSWORD,
	REDIS_USERNAME
} from '../environment.js';
import { internalError } from '../models/error.model.js';
import { LoggerService } from './logger.service.js';
import { EventEmitter } from 'events';
import Redlock from 'redlock';

@injectable()
export class RedisService extends LoggerService {
	protected readonly DEFAULT_TTL: number = 32 * 60 * 60 * 24; // 32 days
	protected redis: Redis;
	protected isConnected = false;
	public events: EventEmitter;

	constructor() {
		super();
		this.events = new EventEmitter();
		const redisOptions = this.loadRedisConfig();
		this.redis = new Redis(redisOptions);

		this.redis.on('connect', () => {
			if (!this.isConnected) {
				this.logger.verbose('Connected to Redis');
			} else {
				this.logger.verbose('Reconnected to Redis');
			}

			this.isConnected = true;
			this.events.emit('redisConnected');
		});
		this.redis.on('error', (e) => this.logger.error('Error Redis', e));

		this.redis.on('end', () => {
			this.isConnected = false;
			this.logger.warn('Redis disconnected');
		});
	}

	createRedlock(retryCount = -1, retryDelay = 200) {
		return new Redlock([this.redis], {
			driftFactor: 0.01,
			retryCount,
			retryDelay,
			retryJitter: 200 // Random variation in the time between retries.
		});
	}

	public onReady(callback: () => void) {
		if (this.isConnected) {
			callback();
		}

		this.events.on('redisConnected', callback);
	}

	/**
	 * Retrieves all keys from Redis that match the specified pattern.
	 *
	 * @param pattern - The pattern to match against Redis keys.
	 * @returns A promise that resolves to an array of matching keys.
	 * @throws {internalRecordingError} If there is an error retrieving keys from Redis.
	 */
	async getKeys(pattern: string): Promise<string[]> {
		let cursor = '0';
		const keys: Set<string> = new Set();

		do {
			const [nextCursor, partialKeys] = await this.redis.scan(cursor, 'MATCH', pattern);
			partialKeys.forEach((key) => keys.add(key));
			cursor = nextCursor;
		} while (cursor !== '0');

		return Array.from(keys);
	}

	/**
	 * Checks if a given key exists in the Redis store.
	 *
	 * @param {string} key - The key to check for existence.
	 * @returns {Promise<boolean>} - A promise that resolves to `true` if the key exists, otherwise `false`.
	 */
	async exists(key: string): Promise<boolean> {
		const result = await this.get(key);
		return !!result;
	}

	get(key: string, hashKey?: string): Promise<string | null> {
		try {
			if (hashKey) {
				return this.redis.hget(key, hashKey);
			} else {
				return this.redis.get(key);
			}
		} catch (error) {
			this.logger.error('Error getting value from Redis', error);
			throw internalError(error);
		}
	}

	// getAll(key: string): Promise<Record<string, string>> {
	// 	try {
	// 		return this.redis.hgetall(key);
	// 	} catch (error) {
	// 		this.logger.error('Error getting value from Redis', error);
	// 		throw internalError(error);
	// 	}
	// }

	// getDel(key: string): Promise<string | null> {
	// 	try {
	// 		return this.redis.getdel(key);
	// 	} catch (error) {
	// 		this.logger.error('Error getting and deleting value from Redis', error);
	// 		throw internalError(error);
	// 	}
	// }

	/**
	 * Sets a value in Redis with an optional TTL (time-to-live).
	 *
	 * @param {string} key - The key under which the value will be stored.
	 * @param {any} value - The value to be stored. Can be a string, number, boolean, or object.
	 * @param {boolean} [withTTL=true] - Whether to set a TTL for the key. Defaults to true.
	 * @returns {Promise<string>} - A promise that resolves to 'OK' if the operation is successful.
	 * @throws {Error} - Throws an error if the value type is invalid or if there is an issue setting the value in Redis.
	 */
	async set(key: string, value: any, withTTL = true): Promise<string> {
		try {
			const valueType = typeof value;

			if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
				if (withTTL) {
					await this.redis.set(key, value, 'EX', this.DEFAULT_TTL);
				} else {
					await this.redis.set(key, value);
				}
			} else if (valueType === 'object') {
				await this.redis.hmset(key, value);

				if (withTTL) await this.redis.expire(key, this.DEFAULT_TTL);
			} else {
				throw new Error('Invalid value type');
			}

			return 'OK';
		} catch (error) {
			this.logger.error('Error setting value in Redis', error);
			throw error;
		}
	}

	/**
	 * Deletes a key from Redis.
	 * @param key - The key to delete.
	 * @param hashKey - The hash key to delete. If provided, it will delete the hash key from the hash stored at the given key.
	 * @returns A promise that resolves to the number of keys deleted.
	 */
	delete(key: string, hashKey?: string): Promise<number> {
		try {
			if (hashKey) {
				return this.redis.hdel(key, hashKey);
			} else {
				return this.redis.del(key);
			}
		} catch (error) {
			throw internalError(`Error deleting key from Redis ${error}`);
		}
	}

	quit() {
		this.redis.quit();
	}

	async checkHealth() {
		return (await this.redis.ping()) === 'PONG';
	}

	private loadRedisConfig(): RedisOptions {
		// Check if openviduCall module is enabled. If not, exit the process
		config.checkModuleEnabled();

		//Check if Redis Sentinel is configured
		if (REDIS_SENTINEL_HOST_LIST) {
			const sentinels: Array<SentinelAddress> = [];
			const sentinelHosts = REDIS_SENTINEL_HOST_LIST.split(',');
			sentinelHosts.forEach((host) => {
				const rawHost = host.split(':');

				if (rawHost.length !== 2) {
					throw new Error('The Redis Sentinel host list is required');
				}

				const hostName = rawHost[0];
				const port = parseInt(rawHost[1]);
				sentinels.push({ host: hostName, port });
			});

			if (!REDIS_SENTINEL_PASSWORD) throw new Error('The Redis Sentinel password is required');

			this.logger.verbose('Using Redis Sentinel');
			return {
				sentinels,
				sentinelPassword: REDIS_SENTINEL_PASSWORD,
				username: REDIS_USERNAME,
				password: REDIS_PASSWORD,
				name: REDIS_SENTINEL_MASTER_NAME,
				db: Number(REDIS_DB)
			};
		} else {
			this.logger.verbose('Using Redis standalone');
			return {
				port: Number(REDIS_PORT),
				host: REDIS_HOST,
				username: REDIS_USERNAME,
				password: REDIS_PASSWORD,
				db: Number(REDIS_DB)
			};
		}
	}
}
