import { TestBed } from '@angular/core/testing';

import { UnitsApi } from './units-api';

describe('UnitsApi', () => {
  let service: UnitsApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitsApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
