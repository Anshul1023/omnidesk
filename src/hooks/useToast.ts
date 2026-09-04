import { useState } from 'react';

type ToastState = { message: string; visible: boolean };

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 1700);
  };

  return { toast, showToast };
}
