import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveWorkout } from './save-workout';

describe('SaveWorkout', () => {
  let component: SaveWorkout;
  let fixture: ComponentFixture<SaveWorkout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveWorkout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveWorkout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
