import { TestBed } from '@angular/core/testing';

import { OwnersApi } from './owners-api';

describe('OwnersApi', () => {
  let service: OwnersApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OwnersApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
