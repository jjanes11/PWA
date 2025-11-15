import { Injectable, signal, Signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WorkoutUiService {
  private readonly _workoutInProgressDialog = signal(false);

  get workoutInProgressDialog(): Signal<boolean> {
    return this._workoutInProgressDialog.asReadonly();
  }

  showWorkoutInProgressDialog(): void {
    this._workoutInProgressDialog.set(true);
  }

  hideWorkoutInProgressDialog(): void {
    this._workoutInProgressDialog.set(false);
  }
}
