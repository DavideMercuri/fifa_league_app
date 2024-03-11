import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamTransactionComponent } from './team-transaction.component';

describe('TeamTransactionComponent', () => {
  let component: TeamTransactionComponent;
  let fixture: ComponentFixture<TeamTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamTransactionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
