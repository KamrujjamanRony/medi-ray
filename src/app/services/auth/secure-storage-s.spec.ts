import { TestBed } from '@angular/core/testing';

import { SecureStorageS } from './secure-storage-s';

describe('SecureStorageS', () => {
  let service: SecureStorageS;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecureStorageS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
