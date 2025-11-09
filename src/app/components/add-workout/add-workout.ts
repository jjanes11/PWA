import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { Exercise } from '../../models/workout.models';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { createSetTypeMenuMixin } from '../../mixins/set-type-menu.mixin';

@Component({
  selector: 'app-add-workout',
  imports: [CommonModule, ConfirmationDialog],
  templateUrl: './add-workout.html',
  styleUrl: './add-workout.css'
})
export class AddWorkoutComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  currentWorkout = this.workoutService.currentWorkout;
  showDiscardDialog = signal(false);
  showMenu = signal(false);
  selectedExerciseId = signal<string | null>(null);
  draggedExerciseId = signal<string | null>(null);
  dragOverExerciseId = signal<string | null>(null);
  
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
  
  // Touch drag state
  private touchStartY = 0;
  private touchStartX = 0;
  private isDragging = false;
  private draggedElement: HTMLElement | null = null;
  private placeholder: HTMLElement | null = null;

  ngOnInit(): void {
    // Create a new workout if none exists
    if (!this.currentWorkout()) {
      this.workoutService.createWorkout('New Workout');
    }
  }

  goBack(): void {
    this.router.navigate(['/workouts']);
  }

  finishWorkout(): void {
    const workout = this.currentWorkout();
    if (workout && workout.exercises.length > 0) {
      // Navigate to save workout page if there are exercises
      this.router.navigate(['/save-workout']);
    } else {
      // If no exercises, just go back
      this.goBack();
    }
  }

  addExercise(): void {
    this.router.navigate(['/add-exercise']);
  }

  discardWorkout(): void {
    this.showDiscardDialog.set(true);
  }

  onDiscardConfirmed(): void {
    const workout = this.currentWorkout();
    if (workout) {
      // Delete the current workout and clear current workout
      this.workoutService.deleteWorkout(workout.id);
      this.workoutService.setCurrentWorkout(null);
    }
    this.showDiscardDialog.set(false);
    this.goBack();
  }

  onDiscardCancelled(): void {
    this.showDiscardDialog.set(false);
  }

  addSetToExercise(exerciseId: string): void {
    const workout = this.currentWorkout();
    if (workout) {
      this.workoutService.addSetToExercise(workout.id, exerciseId);
    }
  }

  updateSet(exerciseId: string, setId: string, field: 'reps' | 'weight', value: number): void {
    const workout = this.currentWorkout();
    if (workout) {
      const exercise = workout.exercises.find(e => e.id === exerciseId);
      const set = exercise?.sets.find(s => s.id === setId);
      if (set) {
        const updatedSet = { ...set, [field]: value };
        this.workoutService.updateSet(workout.id, exerciseId, updatedSet);
      }
    }
  }

  toggleSetComplete(exerciseId: string, setId: string): void {
    const workout = this.currentWorkout();
    if (workout) {
      const exercise = workout.exercises.find(e => e.id === exerciseId);
      const set = exercise?.sets.find(s => s.id === setId);
      if (set) {
        const updatedSet = { ...set, completed: !set.completed };
        this.workoutService.updateSet(workout.id, exerciseId, updatedSet);
      }
    }
  }

  openMenu(exerciseId: string, event: Event): void {
    event.stopPropagation();
    this.selectedExerciseId.set(exerciseId);
    this.showMenu.set(true);
  }

  closeMenu(): void {
    this.showMenu.set(false);
    this.selectedExerciseId.set(null);
  }

  replaceExercise(): void {
    const exerciseId = this.selectedExerciseId();
    this.closeMenu();
    
    if (exerciseId) {
      this.router.navigate(['/add-exercise'], {
        state: { 
          returnUrl: '/workout/new',
          replaceExerciseId: exerciseId
        }
      });
    }
  }

  removeExercise(): void {
    const exerciseId = this.selectedExerciseId();
    const workout = this.currentWorkout();
    if (exerciseId && workout) {
      this.workoutService.removeExerciseFromWorkout(workout.id, exerciseId);
    }
    this.closeMenu();
  }

  // Drag and Drop handlers for desktop
  onDragStart(exerciseId: string, event: DragEvent): void {
    this.draggedExerciseId.set(exerciseId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', exerciseId);
    }
    // Add a small delay to allow the browser to create the drag image
    setTimeout(() => {
      const draggedCard = event.target as HTMLElement;
      draggedCard.style.opacity = '0.5';
    }, 0);
  }

  onDragOver(exerciseId: string, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const draggedId = this.draggedExerciseId();
    if (draggedId && draggedId !== exerciseId) {
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
      this.dragOverExerciseId.set(exerciseId);
    }
  }

  onDragEnter(exerciseId: string, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const draggedId = this.draggedExerciseId();
    if (draggedId && draggedId !== exerciseId) {
      this.dragOverExerciseId.set(exerciseId);
    }
  }

  onDragLeave(exerciseId: string, event: DragEvent): void {
    event.stopPropagation();
    
    // Only clear if we're leaving the current drag-over target
    const target = event.target as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement;
    
    // Check if we're actually leaving the card (not just moving to a child element)
    if (!target.contains(relatedTarget)) {
      if (this.dragOverExerciseId() === exerciseId) {
        this.dragOverExerciseId.set(null);
      }
    }
  }

  onDrop(targetExerciseId: string, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const draggedId = this.draggedExerciseId();
    const workout = this.currentWorkout();
    
    if (draggedId && targetExerciseId && draggedId !== targetExerciseId && workout) {
      this.workoutService.reorderExercises(workout.id, draggedId, targetExerciseId);
    }
    
    this.draggedExerciseId.set(null);
    this.dragOverExerciseId.set(null);
  }

  onDragEnd(event: DragEvent): void {
    const draggedCard = event.target as HTMLElement;
    draggedCard.style.opacity = '';
    this.draggedExerciseId.set(null);
    this.dragOverExerciseId.set(null);
  }

  // Touch handlers for mobile
  onTouchStart(exerciseId: string, event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartY = touch.clientY;
    this.touchStartX = touch.clientX;
    this.isDragging = false;
    
    // Start a timer to detect long press
    const longPressTimer = setTimeout(() => {
      if (!this.isDragging) {
        this.startTouchDrag(exerciseId, event);
      }
    }, 200); // 200ms long press
    
    // Store timer to cancel if touch ends early
    (event.target as any)._longPressTimer = longPressTimer;
  }

  private startTouchDrag(exerciseId: string, event: TouchEvent): void {
    this.isDragging = true;
    this.draggedExerciseId.set(exerciseId);
    
    const target = event.target as HTMLElement;
    this.draggedElement = target.closest('.jacaona-exercise-card') as HTMLElement;
    
    if (this.draggedElement) {
      // Create placeholder
      this.placeholder = this.draggedElement.cloneNode(true) as HTMLElement;
      this.placeholder.style.opacity = '0.3';
      this.placeholder.style.pointerEvents = 'none';
      
      // Style dragged element
      this.draggedElement.style.opacity = '0.8';
      this.draggedElement.style.transform = 'scale(1.05)';
      this.draggedElement.style.zIndex = '1000';
      this.draggedElement.style.transition = 'none';
      
      // Prevent scrolling while dragging
      document.body.style.overflow = 'hidden';
    }
  }

  onTouchMove(event: TouchEvent): void {
    // Cancel long press timer if moving before long press completes
    const target = event.target as any;
    if (target._longPressTimer && !this.isDragging) {
      const touch = event.touches[0];
      const moveDistance = Math.sqrt(
        Math.pow(touch.clientX - this.touchStartX, 2) +
        Math.pow(touch.clientY - this.touchStartY, 2)
      );
      
      // If moved more than 10px, cancel long press
      if (moveDistance > 10) {
        clearTimeout(target._longPressTimer);
        target._longPressTimer = null;
      }
      return;
    }

    if (!this.isDragging || !this.draggedElement) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    
    // Move the dragged element
    const deltaY = touch.clientY - this.touchStartY;
    this.draggedElement.style.transform = `translateY(${deltaY}px) scale(1.05)`;
    
    // Find element under touch point (excluding the dragged element itself)
    this.draggedElement.style.pointerEvents = 'none';
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    this.draggedElement.style.pointerEvents = '';
    
    const cardBelow = elementBelow?.closest('.jacaona-exercise-card') as HTMLElement;
    
    // Clear previous drag-over state
    this.dragOverExerciseId.set(null);
    
    if (cardBelow && cardBelow !== this.draggedElement) {
      const targetId = this.getExerciseIdFromElement(cardBelow);
      if (targetId && targetId !== this.draggedExerciseId()) {
        // Set the drag-over state for visual feedback
        this.dragOverExerciseId.set(targetId);
      }
    }
  }

  onTouchEnd(event: TouchEvent): void {
    // Cancel long press timer
    const target = event.target as any;
    if (target._longPressTimer) {
      clearTimeout(target._longPressTimer);
      target._longPressTimer = null;
    }

    if (!this.isDragging) return;
    
    event.preventDefault();
    
    const draggedId = this.draggedExerciseId();
    const targetId = this.dragOverExerciseId();
    const workout = this.currentWorkout();
    
    // Perform the actual reorder in data
    if (draggedId && targetId && draggedId !== targetId && workout) {
      this.workoutService.reorderExercises(workout.id, draggedId, targetId);
      
      // Force UI update by triggering change detection
      setTimeout(() => {
        this.draggedExerciseId.set(null);
        this.dragOverExerciseId.set(null);
      }, 0);
    }
    
    // Cleanup
    if (this.draggedElement) {
      this.draggedElement.style.opacity = '';
      this.draggedElement.style.transform = '';
      this.draggedElement.style.zIndex = '';
      this.draggedElement.style.transition = '';
      this.draggedElement.style.pointerEvents = '';
    }
    
    if (this.placeholder && this.placeholder.parentElement) {
      this.placeholder.parentElement.removeChild(this.placeholder);
    }
    
    document.body.style.overflow = '';
    
    this.isDragging = false;
    this.draggedElement = null;
    this.placeholder = null;
    
    // Clear signals after a small delay to allow for smooth transition
    if (!targetId || draggedId === targetId) {
      this.draggedExerciseId.set(null);
      this.dragOverExerciseId.set(null);
    }
  }

  private getExerciseIdFromElement(element: HTMLElement): string | null {
    // Get the exercise ID by finding the card's position in the list
    const container = element.closest('.jacaona-exercises-container');
    if (!container) return null;
    
    const cards = Array.from(container.querySelectorAll('.jacaona-exercise-card'));
    const index = cards.indexOf(element);
    
    if (index === -1) return null;
    
    const exercises = this.currentWorkout()?.exercises || [];
    return exercises[index]?.id || null;
  }
}
