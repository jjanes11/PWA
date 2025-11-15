import { Injectable, signal, computed } from '@angular/core';
import { Workout, Exercise, Set, WorkoutTemplate, WorkoutStats } from '../models/workout.models';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private readonly STORAGE_KEY = 'workout-tracker-data';
  private readonly TEMPLATES_KEY = 'workout-templates';

  // Reactive signals for state management
  private _workouts = signal<Workout[]>([]);
  private _templates = signal<WorkoutTemplate[]>([]);
  private _currentWorkout = signal<Workout | null>(null);
  private _routineDraft = signal<Workout | null>(null); // Separate draft for routine creation
  private _showWorkoutInProgressDialog = signal<boolean>(false);

  // Public readonly signals
  readonly workouts = this._workouts.asReadonly();
  readonly templates = this._templates.asReadonly();
  readonly currentWorkout = this._currentWorkout.asReadonly();
  readonly routineDraft = this._routineDraft.asReadonly();
  readonly showWorkoutInProgressDialog = this._showWorkoutInProgressDialog.asReadonly();

  // Computed statistics
  readonly stats = computed<WorkoutStats>(() => {
    const workouts = this._workouts();
    const completed = workouts.filter(w => w.completed);
    
    const totalExercises = completed.reduce((sum, w) => sum + w.exercises.length, 0);
    const totalSets = completed.reduce((sum, w) => 
      sum + w.exercises.reduce((exerciseSum, e) => exerciseSum + e.sets.length, 0), 0
    );
    const totalWeight = completed.reduce((sum, w) =>
      sum + w.exercises.reduce((exerciseSum, e) =>
        exerciseSum + e.sets.reduce((setSum, s) => setSum + (s.weight * s.reps), 0), 0
      ), 0
    );
    const totalDuration = completed.reduce((sum, w) => sum + (w.duration || 0), 0);

    return {
      totalWorkouts: completed.length,
      totalExercises,
      totalSets,
      totalWeight,
      averageDuration: completed.length > 0 ? totalDuration / completed.length : 0
    };
  });

  constructor() {
    this.loadData();
  }

  // Workout Management
  createWorkout(name: string): Workout {
    const now = new Date();
    const workout: Workout = {
      id: this.generateId(),
      name,
      date: now,
      startTime: now,
      exercises: [],
      completed: false
    };

    const workouts = [...this._workouts(), workout];
    this._workouts.set(workouts);
    this._currentWorkout.set(workout);
    this.saveData();
    
    return workout;
  }

  createWorkoutFromTemplate(template: WorkoutTemplate): Workout {
    const workout = this.createWorkout(template.name);
    
    const exercises: Exercise[] = template.exercises.map(exerciseTemplate => ({
      id: this.generateId(),
      name: exerciseTemplate.name,
      sets: exerciseTemplate.sets.map(setTemplate => ({
        id: this.generateId(),
        reps: setTemplate.reps,
        weight: setTemplate.weight,
        completed: false,
        type: setTemplate.type
      }))
    }));

    workout.exercises = exercises;
    this.updateWorkout(workout);
    
    return workout;
  }

  createDraftFromWorkout(workoutId: string): Workout | null {
    const sourceWorkout = this._workouts().find(w => w.id === workoutId);
    if (!sourceWorkout) {
      return null;
    }

    // Create a new draft workout (don't use createWorkout to avoid setting currentWorkout)
    const now = new Date();
    const draftWorkout: Workout = {
      id: this.generateId(),
      name: sourceWorkout.name,
      date: now,
      startTime: now,
      exercises: sourceWorkout.exercises.map(exercise => ({
        id: this.generateId(),
        name: exercise.name,
        sets: exercise.sets.map(set => ({
          id: this.generateId(),
          reps: set.reps,
          weight: set.weight,
          completed: false,
          type: set.type,
          restTime: set.restTime,
          notes: set.notes
        }))
      })),
      completed: false
    };

    // Add to workouts list
    const workouts = [...this._workouts(), draftWorkout];
    this._workouts.set(workouts);
    
    // Set as routine draft (not currentWorkout, to preserve in-progress workout)
    this._routineDraft.set(draftWorkout);
    this.saveData();
    
    return draftWorkout;
  }

  createRoutineDraft(name: string = 'New Routine'): Workout {
    const now = new Date();
    const draftWorkout: Workout = {
      id: this.generateId(),
      name,
      date: now,
      startTime: now,
      exercises: [],
      completed: false
    };

    const workouts = [...this._workouts(), draftWorkout];
    this._workouts.set(workouts);
    this._routineDraft.set(draftWorkout);
    this.saveData();

    return draftWorkout;
  }

  updateWorkout(workout: Workout): void {
    this.updateWorkoutById(workout.id, () => workout);
  }

  clearRoutineDraft(): void {
    this._routineDraft.set(null);
  }

  deleteWorkout(id: string): void {
    const workouts = this._workouts().filter(w => w.id !== id);
    this.commitWorkouts(workouts);
  }

  setCurrentWorkout(workout: Workout | null): void {
    this._currentWorkout.set(workout);
  }

  setRoutineDraft(workout: Workout | null): void {
    this._routineDraft.set(workout);
  }

  completeWorkout(workoutId: string): void {
    const workouts = this._workouts().map(w => 
      w.id === workoutId 
        ? { ...w, completed: true, duration: this.calculateDuration(w) }
        : w
    );
    this._workouts.set(workouts);
    this.saveData();
  }

  // Exercise Management
  addExerciseToWorkout(workoutId: string, exerciseName: string): Exercise {
    let createdExercise: Exercise | null = null;

    const updatedWorkout = this.updateWorkoutById(workoutId, workout => {
      const exercise: Exercise = {
        id: this.generateId(),
        name: exerciseName,
        sets: []
      };
      createdExercise = exercise;

      return {
        ...workout,
        exercises: [...workout.exercises, exercise]
      };
    });

    if (!updatedWorkout || !createdExercise) {
      throw new Error(`Workout ${workoutId} not found`);
    }

    return createdExercise;
  }

  removeExerciseFromWorkout(workoutId: string, exerciseId: string): void {
    this.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.filter(e => e.id !== exerciseId)
    }));
  }

  replaceExerciseInWorkout(workoutId: string, exerciseId: string, newExerciseName: string): void {
    this.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise =>
        exercise.id === exerciseId ? { ...exercise, name: newExerciseName } : exercise
      )
    }));
  }

  reorderExercises(workoutId: string, draggedExerciseId: string, targetExerciseId: string): void {
    this.updateWorkoutById(workoutId, workout => {
      const exercises = [...workout.exercises];
      const draggedIndex = exercises.findIndex(e => e.id === draggedExerciseId);
      const targetIndex = exercises.findIndex(e => e.id === targetExerciseId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return workout;
      }

      const [draggedExercise] = exercises.splice(draggedIndex, 1);
      exercises.splice(targetIndex, 0, draggedExercise);

      return { ...workout, exercises };
    });
  }

  // Set Management
  addSetToExercise(workoutId: string, exerciseId: string): Set {
    let createdSet: Set | null = null;

    const updatedWorkout = this.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        const newSet: Set = {
          id: this.generateId(),
          reps: 0,
          weight: 0,
          completed: false
        };

        createdSet = newSet;

        return {
          ...exercise,
          sets: [...exercise.sets, newSet]
        };
      })
    }));

    if (!updatedWorkout || !createdSet) {
      throw new Error(`Workout ${workoutId} or exercise ${exerciseId} not found`);
    }

    return createdSet;
  }

  updateSet(workoutId: string, exerciseId: string, set: Set): void {
    this.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map(existingSet =>
                existingSet.id === set.id ? set : existingSet
              )
            }
          : exercise
      )
    }));
  }

  removeSetFromExercise(workoutId: string, exerciseId: string, setId: string): void {
    this.updateWorkoutById(workoutId, workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter(existingSet => existingSet.id !== setId)
            }
          : exercise
      )
    }));
  }

  // Template Management
  getTemplates(): readonly WorkoutTemplate[] {
    return this._templates();
  }

  findTemplateById(templateId: string): WorkoutTemplate | undefined {
    return this._templates().find(template => template.id === templateId);
  }

  instantiateWorkoutFromTemplate(template: WorkoutTemplate): Workout {
    return this.createWorkoutFromTemplate(template);
  }

  saveAsTemplate(workout: Workout): WorkoutTemplate {
    const template: WorkoutTemplate = {
      id: this.generateId(),
      name: workout.name,
      exercises: workout.exercises.map(e => ({
        id: this.generateId(),
        name: e.name,
        sets: e.sets.map(s => ({
          reps: s.reps,
          weight: s.weight,
          type: s.type
        }))
      }))
    };

    const templates = [...this._templates(), template];
    this.commitTemplates(templates);

    return template;
  }

  saveTemplateDirectly(template: WorkoutTemplate): void {
    const templates = [...this._templates(), template];
    this.commitTemplates(templates);
  }

  updateTemplate(template: WorkoutTemplate): WorkoutTemplate | null {
    return this.updateTemplateById(template.id, () => template);
  }

  deleteTemplate(id: string): void {
    const templates = this._templates().filter(t => t.id !== id);
    this.commitTemplates(templates);
  }

  reorderTemplates(draggedTemplateId: string, targetTemplateId: string): void {
    const templates = [...this._templates()];
    const draggedIndex = templates.findIndex(t => t.id === draggedTemplateId);
    const targetIndex = templates.findIndex(t => t.id === targetTemplateId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedTemplate] = templates.splice(draggedIndex, 1);
      templates.splice(targetIndex, 0, draggedTemplate);
    }

    this.commitTemplates(templates);
  }

  // Utility Methods
  private updateWorkoutById(
    workoutId: string,
    mutate: (workout: Workout) => Workout
  ): Workout | null {
    let updatedWorkout: Workout | null = null;

    const updatedWorkouts = this._workouts().map((workout) => {
      if (workout.id !== workoutId) {
        return workout;
      }

      updatedWorkout = mutate(workout);
      return updatedWorkout;
    });

    if (!updatedWorkout) {
      return null;
    }

    this.commitWorkouts(updatedWorkouts, updatedWorkout);
    return updatedWorkout;
  }

  private updateTemplateById(
    templateId: string,
    mutate: (template: WorkoutTemplate) => WorkoutTemplate
  ): WorkoutTemplate | null {
    let updatedTemplate: WorkoutTemplate | null = null;

    const updatedTemplates = this._templates().map((template) => {
      if (template.id !== templateId) {
        return template;
      }

      updatedTemplate = mutate(template);
      return updatedTemplate;
    });

    if (!updatedTemplate) {
      return null;
    }

    this.commitTemplates(updatedTemplates);
    return updatedTemplate;
  }

  private commitWorkouts(workouts: Workout[], updatedWorkout?: Workout | null): void {
    this._workouts.set(workouts);

    if (updatedWorkout) {
      this.syncDerivedWorkouts(updatedWorkout);
    } else {
      this.ensureDerivedWorkoutsExist(workouts);
    }

    this.saveData();
  }

  private commitTemplates(templates: WorkoutTemplate[]): void {
    this._templates.set(templates);
    this.saveTemplates();
  }

  private syncDerivedWorkouts(updatedWorkout: Workout): void {
    if (this._currentWorkout()?.id === updatedWorkout.id) {
      this._currentWorkout.set(updatedWorkout);
    }

    if (this._routineDraft()?.id === updatedWorkout.id) {
      this._routineDraft.set(updatedWorkout);
    }
  }

  private ensureDerivedWorkoutsExist(workouts: Workout[]): void {
    const current = this._currentWorkout();
    if (current && !workouts.some(w => w.id === current.id)) {
      this._currentWorkout.set(null);
    }

    const draft = this._routineDraft();
    if (draft && !workouts.some(w => w.id === draft.id)) {
      this._routineDraft.set(null);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private calculateDuration(workout: Workout): number {
    const now = new Date();
    const start = new Date(workout.date);
    return Math.round((now.getTime() - start.getTime()) / (1000 * 60)); // minutes
  }

  // Data Persistence
  private saveData(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._workouts()));
    } catch (error) {
      console.error('Failed to save workout data:', error);
    }
  }

  private loadData(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const workouts = JSON.parse(data) as Workout[];
        // Convert date strings back to Date objects
        workouts.forEach(workout => {
          workout.date = new Date(workout.date);
        });
        this._workouts.set(workouts);
      }
    } catch (error) {
      console.error('Failed to load workout data:', error);
      this._workouts.set([]);
    }

    this.loadTemplates();
  }

  private saveTemplates(): void {
    try {
      localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(this._templates()));
    } catch (error) {
      console.error('Failed to save templates:', error);
    }
  }

  private loadTemplates(): void {
    try {
      const data = localStorage.getItem(this.TEMPLATES_KEY);
      if (data) {
        const templates = JSON.parse(data) as WorkoutTemplate[];
        this._templates.set(templates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      this._templates.set([]);
    }
  }
  // Workout In Progress Dialog Management
  showWorkoutInProgressDialogMethod(): void {
    this._showWorkoutInProgressDialog.set(true);
  }

  hideWorkoutInProgressDialog(): void {
    this._showWorkoutInProgressDialog.set(false);
  }
}
