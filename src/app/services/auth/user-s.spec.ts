import { TestBed } from '@angular/core/testing';

import { UserS } from './user-s';

describe('UserS', () => {
  let service: UserS;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
