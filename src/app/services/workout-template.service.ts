import { Injectable } from '@angular/core';
import { Workout, WorkoutTemplate } from '../models/workout.models';
import { WorkoutStoreService } from './workout-store.service';
import { WorkoutSessionService } from './workout-session.service';

@Injectable({ providedIn: 'root' })
export class WorkoutTemplateService {
  get templates() {
    return this.store.templates;
  }

  constructor(
    private readonly store: WorkoutStoreService,
    private readonly session: WorkoutSessionService
  ) {}

  getTemplatesSnapshot(): WorkoutTemplate[] {
    return this.store.getTemplatesSnapshot();
  }

  findTemplateById(templateId: string): WorkoutTemplate | undefined {
    return this.store.getTemplatesSnapshot().find(template => template.id === templateId);
  }

  startWorkoutFromTemplate(template: WorkoutTemplate): Workout {
    return this.session.createWorkoutFromTemplate(template);
  }

  saveFromWorkout(workout: Workout): WorkoutTemplate {
    const template: WorkoutTemplate = {
      id: this.store.generateId(),
      name: workout.name,
      exercises: workout.exercises.map(exercise => ({
        id: this.store.generateId(),
        name: exercise.name,
        sets: exercise.sets.map(set => ({
          reps: set.reps,
          weight: set.weight,
          type: set.type
        }))
      }))
    };

    const templates = [...this.store.getTemplatesSnapshot(), template];
    this.store.commitTemplates(templates);
    return template;
  }

  saveTemplateDirectly(template: WorkoutTemplate): void {
    const templates = [...this.store.getTemplatesSnapshot(), template];
    this.store.commitTemplates(templates);
  }

  updateTemplate(template: WorkoutTemplate): WorkoutTemplate | null {
    return this.store.updateTemplateById(template.id, () => template);
  }

  deleteTemplate(templateId: string): void {
    const templates = this.store.getTemplatesSnapshot().filter(t => t.id !== templateId);
    this.store.commitTemplates(templates);
  }

  reorderTemplates(fromId: string, toId: string): void {
    const templates = [...this.store.getTemplatesSnapshot()];
    const fromIndex = templates.findIndex(t => t.id === fromId);
    const toIndex = templates.findIndex(t => t.id === toId);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const [moved] = templates.splice(fromIndex, 1);
    templates.splice(toIndex, 0, moved);
    this.store.commitTemplates(templates);
  }
}
