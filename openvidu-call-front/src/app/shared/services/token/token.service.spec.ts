import { TestBed } from '@angular/core/testing';

import { TokenService } from './token.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerServiceMock } from '../logger/logger.service.mock';
import { NetworkService } from '../network/network.service';
import { NetworkServiceMock } from '../network/network.service.mock';

describe('TokenService', () => {
	let service: TokenService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: LoggerService, useClass: LoggerServiceMock },
				{ provide: NetworkService, useClass: NetworkServiceMock }
			]
		});
		service = TestBed.inject(TokenService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
