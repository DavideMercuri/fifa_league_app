import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryLeagueTableComponent } from './history-league-table.component';

describe('HistoryLeagueTableComponent', () => {
  let component: HistoryLeagueTableComponent;
  let fixture: ComponentFixture<HistoryLeagueTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryLeagueTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryLeagueTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
