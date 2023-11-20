import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrophyAwardMenuComponent } from './trophy-award-menu.component';

describe('TrophyAwardMenuComponent', () => {
  let component: TrophyAwardMenuComponent;
  let fixture: ComponentFixture<TrophyAwardMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrophyAwardMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrophyAwardMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
