import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastMessage = {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
};

let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let toastState: ToastMessage[] = [];

function notify() {
  toastListeners.forEach((fn) => fn([...toastState]));
}

export function showToast(text: string, type: ToastMessage['type'] = 'success') {
  const id = Date.now().toString();
  toastState = [...toastState, { id, text, type }];
  notify();
  setTimeout(() => {
    toastState = toastState.filter((t) => t.id !== id);
    notify();
  }, 3000);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 px-3 py-2 bg-[#30343A] border border-border rounded-md shadow-lg text-[11px] text-text-primary animate-slide-in"
        >
          {t.type === 'success' && <CheckCircle className="w-3.5 h-3.5 text-success" />}
          {t.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-error" />}
          {t.type === 'info' && <AlertCircle className="w-3.5 h-3.5 text-accent" />}
          <span>{t.text}</span>
          <button
            onClick={() => {
              toastState = toastState.filter((tt) => tt.id !== t.id);
              notify();
            }}
            className="ml-2 text-text-muted hover:text-text-secondary transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
