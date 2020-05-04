import { TestBed } from '@angular/core/testing';

import { DevicesService } from './devices.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerServiceMock } from '../logger/logger.service.mock';
import { UtilsService } from '../utils/utils.service';
import { UtilsServiceMock } from '../utils/utils.service.mock';

describe('DevicesService', () => {
	let service: DevicesService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: LoggerService, useClass: LoggerServiceMock },
				{ provide: UtilsService, useClass: UtilsServiceMock },
			],
		});
		service = TestBed.inject(DevicesService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
