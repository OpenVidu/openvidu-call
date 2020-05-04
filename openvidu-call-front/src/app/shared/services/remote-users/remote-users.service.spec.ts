import { TestBed } from '@angular/core/testing';

import { RemoteUsersService } from './remote-users.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerServiceMock } from '../logger/logger.service.mock';

describe('RemoteUsersService', () => {
	let service: RemoteUsersService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [{ provide: LoggerService, useClass: LoggerServiceMock }]
		});
		service = TestBed.inject(RemoteUsersService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
