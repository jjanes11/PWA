import { Injectable, Signal, computed } from '@angular/core';
import { Workout, WorkoutStats } from '../models/workout.models';
import { DataStoreService } from './data-store.service';

@Injectable({ providedIn: 'root' })
export class WorkoutStatsService {
  readonly statsSignal: Signal<WorkoutStats>;

  constructor(private readonly store: DataStoreService) {
    const workouts = this.store.workoutsSignal();
    this.statsSignal = computed(() => {
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
              exerciseSum + e.sets.reduce((setSum, s) => setSum + (s.weight || 0) * (s.reps || 0), 0),
            0
          ),
        0
      );
      const totalDuration = completed.reduce((sum, w) => {
        if (w.startTime && w.endTime) {
          const duration = Math.round((new Date(w.endTime).getTime() - new Date(w.startTime).getTime()) / (1000 * 60));
          return sum + duration;
        }
        return sum;
      }, 0);

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
