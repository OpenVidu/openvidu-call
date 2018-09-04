import { TestBed, inject } from '@angular/core/testing';

import { OpenviduSessionService } from './openvidu-session.service';

describe('OpenviduSessionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpenviduSessionService]
    });
  });

  it('should be created', inject([OpenviduSessionService], (service: OpenviduSessionService) => {
    expect(service).toBeTruthy();
  }));
});
