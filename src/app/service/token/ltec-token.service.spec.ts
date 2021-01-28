import { TestBed } from '@angular/core/testing';

import { LtecTokenService } from './ltec-token.service';

describe('LtecTokenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LtecTokenService = TestBed.get(LtecTokenService);
    expect(service).toBeTruthy();
  });
});
