import { TestBed } from '@angular/core/testing';

import { OpenViduLayoutService } from './layout.service';

describe('LayoutService', () => {
	let service: OpenViduLayoutService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(OpenViduLayoutService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
