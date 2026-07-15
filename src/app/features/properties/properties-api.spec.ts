import { TestBed } from '@angular/core/testing';

import { PropertiesApi } from './properties-api';

describe('PropertiesApi', () => {
  let service: PropertiesApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertiesApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
