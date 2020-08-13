import { TestBed } from '@angular/core/testing';

import { OpenViduWebrtcService } from './openvidu-webrtc.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerServiceMock } from '../logger/logger.service.mock';
import { LocalUsersService } from '../local-users/local-users.service';
import { LocalUsersServiceMock } from '../local-users/local-users.service.mock';

describe('OpenviduWebrtcService', () => {
	let service: OpenViduWebrtcService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: LoggerService, useClass: LoggerServiceMock },
				{ provide: LocalUsersService, useClass: LocalUsersServiceMock }
			]
		});
		service = TestBed.inject(OpenViduWebrtcService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
