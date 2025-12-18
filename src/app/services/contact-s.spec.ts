import { TestBed } from '@angular/core/testing';

import { ContactS } from './contact-s';

describe('ContactS', () => {
  let service: ContactS;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactS);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
