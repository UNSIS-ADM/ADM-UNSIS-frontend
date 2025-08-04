import { TestBed } from '@angular/core/testing';

import { RegistroFichasService } from './registro-fichas.service';

describe('RegistroFichasService', () => {
  let service: RegistroFichasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistroFichasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
