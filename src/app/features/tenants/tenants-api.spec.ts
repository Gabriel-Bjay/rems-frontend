import { TestBed } from '@angular/core/testing';

import { TenantsApi } from './tenants-api';

describe('TenantsApi', () => {
  let service: TenantsApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenantsApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
