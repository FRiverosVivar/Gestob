import { TestBed } from '@angular/core/testing';

import { LtecAuthenticationService } from './ltec-authentication.service';

describe('LtecAuthenticationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LtecAuthenticationService = TestBed.get(LtecAuthenticationService);
    expect(service).toBeTruthy();
  });
});
