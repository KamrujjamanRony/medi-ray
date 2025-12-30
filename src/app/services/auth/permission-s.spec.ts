import { TestBed } from '@angular/core/testing';

import { PermissionS } from './permission-s';

describe('PermissionS', () => {
  let service: PermissionS;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
