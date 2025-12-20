import { TestBed } from '@angular/core/testing';

import { MenuS } from './menu-s';

describe('MenuS', () => {
  let service: MenuS;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
