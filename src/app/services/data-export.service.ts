import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { DataStoreService } from './data-store.service';
import { ExerciseService } from './exercise.service';

export interface AppDataExport {
  version: string;
  exportDate: string;
  data: {
    workouts: any[];
    routines: any[];
    customExercises: any[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class DataExportService {
  private storageService = inject(StorageService);
  private dataStore = inject(DataStoreService);
  private exerciseService = inject(ExerciseService);

  /**
   * Export all app data to JSON format
   */
  async exportData(): Promise<string> {
    const exportData: AppDataExport = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        workouts: this.dataStore.workoutsSignal()(),
        routines: this.dataStore.routinesSignal()(),
        customExercises: this.exerciseService.getCustomExercises()
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Download exported data as a JSON file
   */
  downloadExport(): void {
    this.exportData().then(jsonString => {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      link.href = url;
      link.download = `jacaona-backup-${timestamp}.json`;
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(url);
    });
  }

  /**
   * Validate imported data structure
   */
  validateImportData(data: any): { valid: boolean; error?: string } {
    // Check if it's an object
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid data format' };
    }

    // Check version exists
    if (!data.version) {
      return { valid: false, error: 'Missing version information' };
    }

    // Check data structure
    if (!data.data || typeof data.data !== 'object') {
      return { valid: false, error: 'Missing data section' };
    }

    // Check required arrays
    if (!Array.isArray(data.data.workouts)) {
      return { valid: false, error: 'Invalid workouts data' };
    }

    if (!Array.isArray(data.data.routines)) {
      return { valid: false, error: 'Invalid routines data' };
    }

    if (!Array.isArray(data.data.customExercises)) {
      return { valid: false, error: 'Invalid custom exercises data' };
    }

    return { valid: true };
  }

  /**
   * Import data from JSON string
   */
  async importData(jsonString: string, options: { merge: boolean } = { merge: false }): Promise<{ success: boolean; error?: string; imported?: { workouts: number; routines: number; exercises: number } }> {
    try {
      const data = JSON.parse(jsonString);
      
      // Validate structure
      const validation = this.validateImportData(data);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // If not merging, clear existing data first
      if (!options.merge) {
        await this.storageService.clearAllData();
      }

      // Import custom exercises first (workouts may reference them)
      const exercisesImported = await this.importCustomExercises(data.data.customExercises, options.merge);

      // Import routines
      const routinesImported = await this.importRoutines(data.data.routines, options.merge);

      // Import workouts
      const workoutsImported = await this.importWorkouts(data.data.workouts, options.merge);

      return {
        success: true,
        imported: {
          workouts: workoutsImported,
          routines: routinesImported,
          exercises: exercisesImported
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse JSON file'
      };
    }
  }

  /**
   * Import workouts
   */
  private async importWorkouts(workouts: any[], merge: boolean): Promise<number> {
    if (!merge) {
      await this.storageService.set('workouts', workouts);
      return workouts.length;
    }

    // Merge mode: add new workouts, skip duplicates by ID
    const existing = this.dataStore.workoutsSignal()();
    const existingIds = new Set(existing.map((w: any) => w.id));
    
    const newWorkouts = workouts.filter(w => !existingIds.has(w.id));
    const merged = [...existing, ...newWorkouts];
    
    await this.storageService.set('workouts', merged);
    return newWorkouts.length;
  }

  /**
   * Import routines
   */
  private async importRoutines(routines: any[], merge: boolean): Promise<number> {
    if (!merge) {
      await this.storageService.set('routines', routines);
      return routines.length;
    }

    // Merge mode: add new routines, skip duplicates by ID
    const existing = this.dataStore.routinesSignal()();
    const existingIds = new Set(existing.map((r: any) => r.id));
    
    const newRoutines = routines.filter(r => !existingIds.has(r.id));
    const merged = [...existing, ...newRoutines];
    
    await this.storageService.set('routines', merged);
    return newRoutines.length;
  }

  /**
   * Import custom exercises
   */
  private async importCustomExercises(exercises: any[], merge: boolean): Promise<number> {
    if (!merge) {
      await this.storageService.set('customExercises', exercises);
      return exercises.length;
    }

    // Merge mode: add new exercises, skip duplicates by ID
    const existing = this.exerciseService.getCustomExercises();
    const existingIds = new Set(existing.map((e: any) => e.id));
    
    const newExercises = exercises.filter(e => !existingIds.has(e.id));
    const merged = [...existing, ...newExercises];
    
    await this.storageService.set('customExercises', merged);
    return newExercises.length;
  }

  /**
   * Import data from a file
   */
  async importFromFile(file: File, options: { merge: boolean } = { merge: false }): Promise<{ success: boolean; error?: string; imported?: { workouts: number; routines: number; exercises: number } }> {
    try {
      const text = await file.text();
      return await this.importData(text, options);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to read file'
      };
    }
  }
}
