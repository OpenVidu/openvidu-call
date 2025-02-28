import { inject, injectable } from 'inversify';
import { LoggerService } from './index.js';
import { SystemEventService } from './system-event.service.js';
import { CronJob } from 'cron';
import { MutexService } from './mutex.service.js';

@injectable()
export class TaskSchedulerService {
	protected roomGarbageCollectorJob: CronJob | null = null;

	constructor(
		@inject(LoggerService) protected logger: LoggerService,
		@inject(SystemEventService) protected systemEventService: SystemEventService,
		@inject(MutexService) protected mutexService: MutexService
	) {}

	/**
	 * Starts the room garbage collector which runs a specified callback function every hour.
	 * The garbage collector acquires a lock to ensure that only one instance runs at a time.
	 * If a lock cannot be acquired, the garbage collection is skipped for that hour.
	 *
	 * @param callbackFn - The callback function to be executed for garbage collection.
	 * @returns A promise that resolves when the garbage collector has been successfully started.
	 */
	async startRoomGarbageCollector(callbackFn: () => Promise<void>): Promise<void> {
		const lockName = 'room-garbage-lock';
		const lockTtl = 59 * 60 * 1000; // TTL of 59 minutes

		if (this.roomGarbageCollectorJob) {
			this.roomGarbageCollectorJob.stop();
			this.roomGarbageCollectorJob = null;
		}

		// Create a cron job to run every hour
		this.roomGarbageCollectorJob = new CronJob('0 * * * *', async () => {
			try {
				const lock = await this.mutexService.acquire(lockName, lockTtl);

				if (!lock) {
					this.logger.debug('Failed to acquire lock for room garbage collection. Skipping.');
					return;
				}

				this.logger.debug('Lock acquired for room garbage collection.');

				await callbackFn();
			} catch (error) {
				this.logger.error('Error running room garbage collection:', error);
			}
		});

		// Start the job
		this.logger.debug('Starting room garbage collector');
		this.roomGarbageCollectorJob.start();
	}
}
