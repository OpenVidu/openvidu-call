import { TestBed } from '@angular/core/testing';

import { AvatarService } from './avatar.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerServiceMock } from '../logger/logger.service.mock';
import { LocalUsersServiceMock } from '../local-users/local-users.service.mock';
import { LocalUsersService } from '../local-users/local-users.service';

describe('AvatarService', () => {
	let service: AvatarService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: LoggerService, useClass: LoggerServiceMock },
				{ provide: LocalUsersService, useClass: LocalUsersServiceMock }
			]
		});
		service = TestBed.inject(AvatarService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
