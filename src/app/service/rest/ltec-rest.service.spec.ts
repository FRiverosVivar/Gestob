import { TestBed } from '@angular/core/testing';

import { LtecRestService } from './ltec-rest.service';

describe('LtecRestService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LtecRestService = TestBed.get(LtecRestService);
    expect(service).toBeTruthy();
  });
});
