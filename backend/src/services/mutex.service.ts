import Redlock, { Lock } from 'redlock';
import { RedisService } from './redis.service.js';
import { inject, injectable } from 'inversify';
import { RedisKeyPrefix } from '../models/redis.model.js';

@injectable()
export class MutexService {
	protected redlockWithoutRetry: Redlock;
	protected locks: Map<string, Lock>;
	protected readonly TTL_MS = 10_000;

	constructor(@inject(RedisService) protected redisService: RedisService) {
		this.redlockWithoutRetry = this.redisService.createRedlock(0);
		this.locks = new Map();
	}

	/**
	 * Acquires a lock for the specified resource.
	 * @param resource The resource to acquire a lock for.
	 * @param ttl The time-to-live (TTL) for the lock in milliseconds. Defaults to the TTL value of the MutexService.
	 * @returns A Promise that resolves to the acquired Lock object.
	 */
	async acquire(resource: string, ttl: number = this.TTL_MS): Promise<Lock | null> {
		resource = RedisKeyPrefix.LOCK + resource;

		try {
			const lock = await this.redlockWithoutRetry.acquire([resource], ttl);
			this.locks.set(resource, lock);
			return lock;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Releases a lock on a resource.
	 *
	 * @param resource - The resource to release the lock on.
	 * @returns A Promise that resolves when the lock is released.
	 */
	async release(resource: string): Promise<void> {
		resource = RedisKeyPrefix.LOCK + resource;
		const lock = this.locks.get(resource);

		if (lock) {
			await lock.release();
			this.locks.delete(resource);
		}
	}
}
