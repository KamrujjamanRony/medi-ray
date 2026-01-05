import { TestBed } from '@angular/core/testing';

import { ItemS } from './item-s';

describe('ItemS', () => {
  let service: ItemS;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
