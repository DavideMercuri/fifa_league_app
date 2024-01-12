import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryPlayersStatsComponent } from './history-players-stats.component';

describe('HistoryPlayersStatsComponent', () => {
  let component: HistoryPlayersStatsComponent;
  let fixture: ComponentFixture<HistoryPlayersStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryPlayersStatsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryPlayersStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
