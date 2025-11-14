import { inject, signal, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from '../services/navigation.service';

export interface NavigationContextOptions {
  defaultOrigin: string;
  cleanup?: () => void;
}

export interface NavigationContext {
  origin: Signal<string>;
  exit: (options?: { skipCleanup?: boolean }) => Promise<boolean>;
  performCleanup: () => void;
  navigateWithReturn: (path: string | any[], additionalState?: Record<string, unknown>) => void;
  setCleanup: (cleanup?: () => void) => void;
  setOrigin: (origin: string) => void;
}

export function useNavigationContext(options: NavigationContextOptions): NavigationContext {
  const router = inject(Router);
  const navigationService = inject(NavigationService);

  let cleanup: (() => void) | undefined = options.cleanup;
  const originSignal = signal(navigationService.getReturnUrl(options.defaultOrigin));

  const performCleanup = () => {
    cleanup?.();
  };

  const exit = async (options?: { skipCleanup?: boolean }) => {
    if (!options?.skipCleanup) {
      performCleanup();
    }

    return router.navigateByUrl(originSignal());
  };

  const navigateWithReturn = (path: string | any[], additionalState?: Record<string, unknown>) => {
    navigationService.navigateWithReturnUrl(path, router.url, additionalState);
  };

  const setCleanup = (newCleanup?: () => void) => {
    cleanup = newCleanup;
  };

  const setOrigin = (origin: string) => {
    originSignal.set(origin);
  };

  return {
    origin: originSignal.asReadonly(),
    exit,
    performCleanup,
    navigateWithReturn,
    setCleanup,
    setOrigin
  };
}
