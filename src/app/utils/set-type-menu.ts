import { signal } from '@angular/core';

export interface SetSelection {
  exerciseId: string;
  setId: string;
}

export function useSetTypeMenu() {
  const isOpen = signal(false);
  const selectedSet = signal<SetSelection | null>(null);

  function open(exerciseId: string, setId: string, event?: Event): void {
    event?.stopPropagation();
    selectedSet.set({ exerciseId, setId });
    isOpen.set(true);
  }

  function close(): void {
    isOpen.set(false);
    selectedSet.set(null);
  }

  return { isOpen, selectedSet, open, close };
}
