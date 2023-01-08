import { TestBed } from '@angular/core/testing';

import { PisteService } from './piste.service';

describe('PisteService', () => {
  let service: PisteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PisteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
