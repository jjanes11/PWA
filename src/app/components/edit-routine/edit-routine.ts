import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { WorkoutTemplate, ExerciseTemplate } from '../../models/workout.models';
import { createSetTypeMenuMixin } from '../../mixins/set-type-menu.mixin';

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
  
  // Set Type Menu Mixin
  private setTypeMenuMixin = createSetTypeMenuMixin(
    this.workoutService,
    () => this.currentWorkout(),
    () => this.currentWorkout()?.id || null
  );
  
  showSetTypeMenu = this.setTypeMenuMixin.showSetTypeMenu;
  selectedSet = this.setTypeMenuMixin.selectedSet;
  openSetTypeMenu = this.setTypeMenuMixin.openSetTypeMenu.bind(this.setTypeMenuMixin);
  closeSetTypeMenu = this.setTypeMenuMixin.closeSetTypeMenu.bind(this.setTypeMenuMixin);
  setSetType = this.setTypeMenuMixin.setSetType.bind(this.setTypeMenuMixin);
  removeSet = this.setTypeMenuMixin.removeSet.bind(this.setTypeMenuMixin);
  getSetTypeDisplay = this.setTypeMenuMixin.getSetTypeDisplay.bind(this.setTypeMenuMixin);
  getSetTypeClass = this.setTypeMenuMixin.getSetTypeClass.bind(this.setTypeMenuMixin);

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
          this.title = existingDraft.name;
        } else {
          // First time loading, create new draft from template
          this.title = foundTemplate.name;
          
          const draftWorkout = this.workoutService.createWorkoutFromTemplate(foundTemplate);
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
    const workout = this.currentWorkout();
    if (workout) {
      this.workoutService.deleteWorkout(workout.id);
      this.workoutService.setCurrentWorkout(null);
    }
    this.router.navigate(['/workouts']);
  }

  update(): void {
    const template = this.template();
    const workout = this.currentWorkout();
    if (template && workout) {
      // Update the workout with the current title
      workout.name = this.title.trim() || 'Untitled Routine';
      this.workoutService.updateWorkout(workout);
      
      // Delete old template
      this.workoutService.deleteTemplate(template.id);
      
      // Save the draft workout as the new template
      this.workoutService.saveAsTemplate(workout);
      
      // Clean up draft workout
      this.workoutService.deleteWorkout(workout.id);
      this.workoutService.setCurrentWorkout(null);
    }
    this.router.navigate(['/workouts']);
  }

  updateSet(exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number): void {
    const workout = this.currentWorkout();
    if (workout) {
      const exercise = workout.exercises[exerciseIndex];
      const set = exercise?.sets[setIndex];
      if (set) {
        const updatedSet = { ...set, [field]: value };
        this.workoutService.updateSet(workout.id, exercise.id, updatedSet);
      }
    }
  }

  addSet(exerciseIndex: number): void {
    const workout = this.currentWorkout();
    if (workout) {
      const exercise = workout.exercises[exerciseIndex];
      if (exercise) {
        this.workoutService.addSetToExercise(workout.id, exercise.id);
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
