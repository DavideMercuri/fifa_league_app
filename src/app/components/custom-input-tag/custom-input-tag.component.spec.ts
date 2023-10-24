import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomInputTagComponent } from './custom-input-tag.component';

describe('CustomInputTagComponent', () => {
  let component: CustomInputTagComponent;
  let fixture: ComponentFixture<CustomInputTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomInputTagComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomInputTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
