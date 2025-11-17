import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private router = inject(Router);

  /**
   * Get the return URL from navigation state or history state
   * @param defaultUrl The URL to return if no returnUrl is found in state
   * @returns The return URL
   */
  getReturnUrl(defaultUrl: string = '/'): string {
    const navigation = this.router.currentNavigation();
    const state = navigation?.extras?.state;
    
    if (state && state['returnUrl']) {
      return state['returnUrl'];
    }
    
    const historyState = history.state;
    if (historyState && historyState['returnUrl']) {
      return historyState['returnUrl'];
    }
    
    return defaultUrl;
  }

  /**
   * Get the replace exercise ID from navigation state or history state
   * Used when replacing an exercise in a workout
   * @returns The exercise ID to replace, or null if not in replace mode
   */
  getReplaceExerciseId(): string | null {
    const navigation = this.router.currentNavigation();
    const state = navigation?.extras?.state;
    
    if (state && state['replaceExerciseId']) {
      return state['replaceExerciseId'];
    }
    
    const historyState = history.state;
    if (historyState && historyState['replaceExerciseId']) {
      return historyState['replaceExerciseId'];
    }
    
    return null;
  }

  /**
   * Get the workout ID from navigation state or history state
   * Used to identify which workout to add exercises to
   * @returns The workout ID being edited, or null if not available
   */
  getWorkoutId(): string | null {
    const navigation = this.router.currentNavigation();
    const state = navigation?.extras?.state;
    
    if (state && state['workoutId']) {
      return state['workoutId'];
    }
    
    const historyState = history.state;
    if (historyState && historyState['workoutId']) {
      return historyState['workoutId'];
    }
    
    return null;
  }

  /**
   * Get the workout source from navigation state
   * Indicates where the workout comes from: activeWorkout, routineDraft, persistedWorkout, or persistedRoutine
   * @returns 'activeWorkout' | 'routineDraft' | 'persistedWorkout' | 'persistedRoutine' | null
   */
  getWorkoutSource(): 'activeWorkout' | 'routineDraft' | 'persistedWorkout' | 'persistedRoutine' | null {
    const navigation = this.router.currentNavigation();
    const state = navigation?.extras?.state;
    
    if (state && state['workoutSource']) {
      return state['workoutSource'];
    }
    
    const historyState = history.state;
    if (historyState && historyState['workoutSource']) {
      return historyState['workoutSource'];
    }
    
    return null;
  }

  /**
   * Get the source workout ID from navigation state or history state
   * Used when creating a routine from an existing workout
   * @returns The source workout ID, or null if creating from scratch
   */
  getSourceWorkoutId(): string | null {
    const navigation = this.router.currentNavigation();
    const state = navigation?.extras?.state;
    
    if (state && state['sourceWorkoutId']) {
      return state['sourceWorkoutId'];
    }
    
    const historyState = history.state;
    if (historyState && historyState['sourceWorkoutId']) {
      return historyState['sourceWorkoutId'];
    }
    
    return null;
  }

  /**
   * Navigate with return URL state
   * @param path The path to navigate to
   * @param returnUrl The URL to return to after completing the action
   */
  navigateWithReturnUrl(path: string | any[], returnUrl: string, additionalState?: any): void {
    const pathArray = Array.isArray(path) ? path : [path];
    this.router.navigate(pathArray, {
      state: { returnUrl, ...additionalState }
    });
  }
}
