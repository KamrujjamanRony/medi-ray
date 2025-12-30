import { TestBed } from '@angular/core/testing';

import { CacheS } from './cache-s';

describe('CacheS', () => {
  let service: CacheS;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
