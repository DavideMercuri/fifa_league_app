import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryLeagueStatsComponent } from './history-league-stats.component';

describe('HistoryLeagueStatsComponent', () => {
  let component: HistoryLeagueStatsComponent;
  let fixture: ComponentFixture<HistoryLeagueStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryLeagueStatsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryLeagueStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
