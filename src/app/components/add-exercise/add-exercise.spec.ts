import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExercise } from './add-exercise';

describe('AddExercise', () => {
  let component: AddExercise;
  let fixture: ComponentFixture<AddExercise>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddExercise]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddExercise);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
