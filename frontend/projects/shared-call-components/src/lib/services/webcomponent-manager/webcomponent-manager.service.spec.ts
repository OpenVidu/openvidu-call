import { TestBed } from '@angular/core/testing';

import { WebComponentManagerService } from './webcomponent-manager.service';

describe('CommandsListenerService', () => {
  let service: WebComponentManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebComponentManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
