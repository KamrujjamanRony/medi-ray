import { TestBed } from '@angular/core/testing';

import { UserAccessS } from './user-access-s';

describe('UserAccessS', () => {
  let service: UserAccessS;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserAccessS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
