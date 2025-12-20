import { TestBed } from '@angular/core/testing';

import { BaseCached } from './base-cached';

describe('BaseCached', () => {
  let service: BaseCached;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseCached);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
