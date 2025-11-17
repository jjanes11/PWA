import { Injectable, Signal, computed } from '@angular/core';
import { Workout, WorkoutStats } from '../models/workout.models';
import { DataStoreService } from './data-store.service';

@Injectable({ providedIn: 'root' })
export class WorkoutStatsService {
  readonly stats: Signal<WorkoutStats>;

  constructor(private readonly store: DataStoreService) {
    const workouts = this.store.workoutsSignal();
    this.stats = computed(() => {
      const completed = workouts().filter(w => w.completed);

      const totalExercises = completed.reduce((sum, w) => sum + w.exercises.length, 0);
      const totalSets = completed.reduce(
        (sum, w) => sum + w.exercises.reduce((exerciseSum, e) => exerciseSum + e.sets.length, 0),
        0
      );
      const totalWeight = completed.reduce(
        (sum, w) =>
          sum +
          w.exercises.reduce(
            (exerciseSum, e) =>
              exerciseSum + e.sets.reduce((setSum, s) => setSum + s.weight * s.reps, 0),
            0
          ),
        0
      );
      const totalDuration = completed.reduce((sum, w) => sum + (w.duration || 0), 0);

      return {
        totalWorkouts: completed.length,
        totalExercises,
        totalSets,
        totalWeight,
        averageDuration: completed.length > 0 ? totalDuration / completed.length : 0
      } satisfies WorkoutStats;
    });
  }
}
