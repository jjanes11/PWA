import { signal, Signal } from '@angular/core';

export interface DiscardGuardOptions {
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface DiscardGuard {
  isVisible: Signal<boolean>;
  message: string;
  confirmText: string;
  cancelText: string;
  open: () => void;
  confirm: () => void;
  cancel: () => void;
}

export function useDiscardGuard(options: DiscardGuardOptions): DiscardGuard {
  const { message, confirmText, cancelText = 'Cancel', onConfirm, onCancel } = options;
  const isVisible = signal(false);

  const open = () => {
    isVisible.set(true);
  };

  const close = () => {
    isVisible.set(false);
  };

  const confirm = () => {
    close();
    onConfirm();
  };

  const cancel = () => {
    close();
    onCancel?.();
  };

  return {
    isVisible,
    message,
    confirmText,
    cancelText,
    open,
    confirm,
    cancel
  };
}
