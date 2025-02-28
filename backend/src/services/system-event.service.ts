import { inject, injectable } from 'inversify';
import { RedisService } from './redis.service.js';
import { LoggerService } from './logger.service.js';

@injectable()
export class SystemEventService {
	constructor(
		@inject(LoggerService) protected logger: LoggerService,
		@inject(RedisService) protected redisService: RedisService
	) {}

	onRedisReady(callback: () => void) {
		this.redisService.onReady(callback);
	}
}
