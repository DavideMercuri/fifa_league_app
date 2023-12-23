import { TestBed } from '@angular/core/testing';

import { SubMenuVoicesService } from './sub-menu-voices.service';

describe('SubMenuVoicesService', () => {
  let service: SubMenuVoicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubMenuVoicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
