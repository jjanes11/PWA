import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWorkout } from './add-workout';

describe('AddWorkout', () => {
  let component: AddWorkout;
  let fixture: ComponentFixture<AddWorkout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWorkout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddWorkout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
