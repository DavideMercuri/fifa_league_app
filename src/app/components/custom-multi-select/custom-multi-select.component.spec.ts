import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomMultiSelectComponent } from './custom-multi-select.component';

describe('CustomMultiSelectComponent', () => {
  let component: CustomMultiSelectComponent;
  let fixture: ComponentFixture<CustomMultiSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomMultiSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomMultiSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
