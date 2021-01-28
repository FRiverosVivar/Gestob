import { TestBed } from '@angular/core/testing';

import { LtecDataService } from './ltec-data.service';

describe('LtecDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LtecDataService = TestBed.get(LtecDataService);
    expect(service).toBeTruthy();
  });
});
