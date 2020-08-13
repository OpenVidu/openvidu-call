import { TestBed } from '@angular/core/testing';

import { LocalUsersService } from './local-users.service';

describe('LocalUsersService', () => {
  let service: LocalUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
