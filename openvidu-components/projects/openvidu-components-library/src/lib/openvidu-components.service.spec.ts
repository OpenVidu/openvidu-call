import { TestBed } from '@angular/core/testing';

import { OpenviduComponentsService } from './openvidu-components.service';

describe('OpenviduComponentsService', () => {
  let service: OpenviduComponentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenviduComponentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
