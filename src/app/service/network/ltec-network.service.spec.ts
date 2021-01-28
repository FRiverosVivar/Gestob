import { TestBed } from '@angular/core/testing';

import { LtecNetworkService } from './ltec-network.service';

describe('LtecNetworkService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LtecNetworkService = TestBed.get(LtecNetworkService);
    expect(service).toBeTruthy();
  });
});
