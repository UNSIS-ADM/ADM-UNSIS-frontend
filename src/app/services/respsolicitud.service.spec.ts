import { TestBed } from '@angular/core/testing';

import { RespsolicitudService } from './respsolicitud.service';

describe('RespsolicitudService', () => {
  let service: RespsolicitudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RespsolicitudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
