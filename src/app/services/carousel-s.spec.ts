import { TestBed } from '@angular/core/testing';

import { CarouselS } from './carousel-s';

describe('CarouselS', () => {
  let service: CarouselS;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarouselS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
