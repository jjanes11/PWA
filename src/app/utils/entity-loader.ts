import { inject, signal, effect, Signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

export interface EntityLoaderConfig<T> {
  /** Function to load entity by ID from data source */
  loadEntity: (id: string) => T | null;
  /** Callback when entity is not found (navigation, error handling, etc.) */
  onNotFound: () => void;
  /** Optional: Route parameter name to extract ID from (defaults to 'id') */
  paramName?: string;
}
export interface EntityLoaderResult<T> {
  entity: WritableSignal<T | null>;
  entityId: Signal<string | undefined>;
}

/**
 * Composition function that handles loading entities from route parameters.
 * Automatically loads entity when route parameter changes and handles not-found cases.
 */
export function useEntityLoader<T>(
  config: EntityLoaderConfig<T>
): EntityLoaderResult<T> {
  const route = inject(ActivatedRoute);
  const entitySignal = signal<T | null>(null);
  
  const paramName = config.paramName ?? 'id';
  const entityId = toSignal(
    route.params.pipe(map(params => params[paramName]))
  );
  
  // Effect to load entity whenever ID changes
  effect(() => {
    const id = entityId();

    if (!id) {
      config.onNotFound();
      return;
    }
    
    const entity = config.loadEntity(id);
    
    if (!entity) {
      config.onNotFound();
      return;
    }
    
    entitySignal.set(entity);
  });
  
  return {
    entity: entitySignal,
    entityId
  };
}
