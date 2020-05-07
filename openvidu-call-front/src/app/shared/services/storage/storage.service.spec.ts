import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerServiceMock } from '../logger/logger.service.mock';

describe('StorageService', () => {
	let service: StorageService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: LoggerService, useClass: LoggerServiceMock },
			],
		});
		service = TestBed.inject(StorageService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
