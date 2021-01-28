import { TestBed } from '@angular/core/testing';

import { LtecOfflineManagerService } from './ltec-offline-manager.service';

describe('LtecOfflineManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LtecOfflineManagerService = TestBed.get(LtecOfflineManagerService);
    expect(service).toBeTruthy();
  });
});
