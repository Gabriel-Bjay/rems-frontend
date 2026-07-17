import { TestBed } from '@angular/core/testing';

import { AgentsApi } from './agents-api';

describe('AgentsApi', () => {
  let service: AgentsApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentsApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
