import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonCheckComponent } from './season-check.component';

describe('SeasonCheckComponent', () => {
  let component: SeasonCheckComponent;
  let fixture: ComponentFixture<SeasonCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeasonCheckComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeasonCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
