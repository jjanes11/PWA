import { signal, Signal } from '@angular/core';

export interface CleanupContextOptions {
  cleanup?: () => void;
}

export interface CleanupContext {
  cleanup: Signal<(() => void) | undefined>;
  setCleanup: (cleanup?: () => void) => void;
  performCleanup: () => void;
}

/**
 * Provides cleanup management for components.
 * Use this to register cleanup functions that should run when discarding drafts or exiting flows.
 */
export function useCleanupContext(options?: CleanupContextOptions): CleanupContext {
  const cleanupFn = signal<(() => void) | undefined>(options?.cleanup);

  const performCleanup = () => {
    cleanupFn()?.();
  };

  const setCleanup = (newCleanup?: () => void) => {
    cleanupFn.set(newCleanup);
  };

  return {
    cleanup: cleanupFn.asReadonly(),
    performCleanup,
    setCleanup
  };
}
