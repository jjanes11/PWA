import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { WorkoutTemplate, ExerciseTemplate } from '../../models/workout.models';

@Component({
  selector: 'app-edit-routine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-routine.html',
  styleUrl: './edit-routine.css'
})
export class EditRoutineComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workoutService = inject(WorkoutService);

  template = signal<WorkoutTemplate | null>(null);
  currentWorkout = this.workoutService.currentWorkout;
  title: string = '';
  private draftWorkoutId: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const foundTemplate = this.workoutService.templates().find(t => t.id === id);
      
      if (foundTemplate) {
        this.template.set(foundTemplate);
        
        // Check if we already have a draft workout (returning from add-exercise)
        const existingDraft = this.workoutService.currentWorkout();
        
        if (existingDraft) {
          // Restore from existing draft
          this.draftWorkoutId = existingDraft.id;
          this.title = existingDraft.name;
        } else {
          // First time loading, create new draft from template
          this.title = foundTemplate.name;
          
          const draftWorkout = this.workoutService.createWorkoutFromTemplate(foundTemplate);
          this.draftWorkoutId = draftWorkout.id;
          this.workoutService.setCurrentWorkout(draftWorkout);
        }
      } else {
        // Template not found, go back
        this.router.navigate(['/workouts']);
      }
    }
  }

  cancel(): void {
    // Clean up draft workout
    if (this.draftWorkoutId) {
      this.workoutService.deleteWorkout(this.draftWorkoutId);
      this.workoutService.setCurrentWorkout(null);
    }
    this.router.navigate(['/workouts']);
  }

  update(): void {
    const template = this.template();
    if (template && this.draftWorkoutId) {
      // Get the current draft workout (which may have new exercises)
      const draftWorkout = this.workoutService.workouts().find(w => w.id === this.draftWorkoutId);
      
      if (draftWorkout) {
        // Update the workout with the current title
        draftWorkout.name = this.title.trim() || 'Untitled Routine';
        this.workoutService.updateWorkout(draftWorkout);
        
        // Delete old template
        this.workoutService.deleteTemplate(template.id);
        
        // Save the draft workout as the new template
        this.workoutService.saveAsTemplate(draftWorkout);
        
        // Clean up draft workout
        this.workoutService.deleteWorkout(this.draftWorkoutId);
        this.workoutService.setCurrentWorkout(null);
      }
    }
    this.router.navigate(['/workouts']);
  }

  updateSet(exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number): void {
    const workout = this.currentWorkout();
    if (workout && this.draftWorkoutId) {
      const exercise = workout.exercises[exerciseIndex];
      const set = exercise?.sets[setIndex];
      if (set) {
        const updatedSet = { ...set, [field]: value };
        this.workoutService.updateSet(this.draftWorkoutId, exercise.id, updatedSet);
      }
    }
  }

  addSet(exerciseIndex: number): void {
    const workout = this.currentWorkout();
    if (workout && this.draftWorkoutId) {
      const exercise = workout.exercises[exerciseIndex];
      if (exercise) {
        this.workoutService.addSetToExercise(this.draftWorkoutId, exercise.id);
      }
    }
  }

  addExercise(): void {
    // Save current title to workout before navigating
    const workout = this.currentWorkout();
    if (workout && this.title.trim()) {
      const updatedWorkout = { ...workout, name: this.title.trim() };
      this.workoutService.updateWorkout(updatedWorkout);
    }
    
    this.router.navigate(['/add-exercise'], {
      state: { returnUrl: '/routine/edit/' + this.template()?.id }
    });
  }
}
