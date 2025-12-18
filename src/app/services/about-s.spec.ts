import { TestBed } from '@angular/core/testing';

import { AboutS } from './about-s';

describe('AboutS', () => {
  let service: AboutS;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AboutS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
