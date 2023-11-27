import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalariesPaymentComponent } from './salaries-payment.component';

describe('SalariesPaymentComponent', () => {
  let component: SalariesPaymentComponent;
  let fixture: ComponentFixture<SalariesPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalariesPaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalariesPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
