import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ExerciseService } from '../../services/exercise.service';
import { DataStoreService } from '../../services/data-store.service';
import { TopBarComponent } from '../top-bar/top-bar';
import { ExerciseListComponent } from '../exercise-list/exercise-list';
import { DialogService } from '../../services/dialog.service';
import { CreateExercise } from '../create-exercise/create-exercise';
import { Exercise } from '../../models/workout.models';

@Component({
  selector: 'app-exercises',
  imports: [TopBarComponent, ExerciseListComponent],
  templateUrl: './exercises.html',
  styleUrl: './exercises.css'
})
export class ExercisesComponent {
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  private dataStore = inject(DataStoreService);
  private dialogService = inject(DialogService);

  allExercises = computed(() => this.exerciseService.allExercises());

  recentExercises = computed(() => {
    const workouts = this.dataStore.workoutsSignal()();
    const finishedWorkouts = workouts
      .filter(w => w.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const recentExerciseNames = new Set<string>();
    const recentExercisesList: Exercise[] = [];

    for (const workout of finishedWorkouts) {
      for (const exercise of workout.exercises) {
        if (!recentExerciseNames.has(exercise.name)) {
          recentExerciseNames.add(exercise.name);
          const exerciseData = this.exerciseService.allExercises().find(e => e.name === exercise.name);
          if (exerciseData) {
            recentExercisesList.push(exerciseData);
          }
        }
      }
    }

    return recentExercisesList.slice(0, 8);
  });

  goBack(): void {
    this.router.navigate(['/analytics']);
  }

  createExercise(): void {
    this.dialogService
      .open(CreateExercise, { fullScreen: true })
      .afterClosed()
      .subscribe();
  }

  onExerciseClick(exercise: Exercise): void {
    const encodedName = encodeURIComponent(exercise.name);
    this.router.navigate(['/exercise', encodedName]);
  }
}
