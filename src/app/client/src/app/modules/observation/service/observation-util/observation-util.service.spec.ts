import { TestBed } from '@angular/core/testing';

import { ObservationUtilService } from '../observation-util.service';

describe('ObservationUtilService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ObservationUtilService = TestBed.get(ObservationUtilService);
    expect(service).toBeTruthy();
  });
});