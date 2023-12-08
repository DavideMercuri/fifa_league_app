import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradePlayersComponent } from './trade-players.component';

describe('TradePlayersComponent', () => {
  let component: TradePlayersComponent;
  let fixture: ComponentFixture<TradePlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradePlayersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradePlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
