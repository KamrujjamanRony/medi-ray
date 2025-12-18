import { TestBed } from '@angular/core/testing';

import { ProductS } from './product-s';

describe('ProductS', () => {
  let service: ProductS;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
