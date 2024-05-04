import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryTransactionsListComponent } from './history-transactions-list.component';

describe('HistoryTransactionsListComponent', () => {
  let component: HistoryTransactionsListComponent;
  let fixture: ComponentFixture<HistoryTransactionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryTransactionsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryTransactionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
