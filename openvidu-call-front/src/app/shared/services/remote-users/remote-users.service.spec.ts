import { TestBed } from '@angular/core/testing';

import { RemoteUsersService } from './remote-users.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerServiceMock } from '../logger/logger.service.mock';
import { UtilsService } from '../utils/utils.service';
import { UtilsServiceMock } from '../utils/utils.service.mock';
import { AvatarServiceMock } from '../avatar/avatar.service.mock';
import { AvatarService } from '../avatar/avatar.service';

describe('RemoteUsersService', () => {
	let service: RemoteUsersService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: LoggerService, useClass: LoggerServiceMock },
				{ provide: UtilsService, useClass: UtilsServiceMock },
				{ provide: AvatarService, useClass: AvatarServiceMock }
			]
		});
		service = TestBed.inject(RemoteUsersService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
