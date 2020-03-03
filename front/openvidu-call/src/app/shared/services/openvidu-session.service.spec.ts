import { TestBed } from '@angular/core/testing';

import { OpenViduSessionService } from './openvidu-session.service';

describe('SessionService', () => {
  let service: OpenViduSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenViduSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
