import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertPlayerComponent } from './insert-player.component';

describe('InsertPlayerComponent', () => {
  let component: InsertPlayerComponent;
  let fixture: ComponentFixture<InsertPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsertPlayerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
