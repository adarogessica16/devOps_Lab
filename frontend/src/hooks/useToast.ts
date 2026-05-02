import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'confirm';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  onConfirm?: () => void;
}

let nextId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, message: string, onConfirm?: () => void) => {
      const id = ++nextId;
      setToasts(prev => [...prev, { id, type, message, onConfirm }]);

      if (type !== 'confirm') {
        setTimeout(() => dismiss(id), 3000);
      }

      return id;
    },
    [dismiss],
  );

  return { toasts, toast, dismiss };
}
