import { TestBed } from '@angular/core/testing';

import { CdkOverlayService } from './cdk-overlay.service';

describe('CdkOverlayService', () => {
  let service: CdkOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdkOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
