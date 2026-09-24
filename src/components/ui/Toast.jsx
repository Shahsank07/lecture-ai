import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import './Toast.css';

const TOAST_LIMIT = 5;
const TOAST_DURATION = 5000;

let toastId = 0;
const listeners = [];

const addToast = (toast) => {
  const id = ++toastId;
  const newToast = { ...toast, id };
  listeners.forEach((listener) => listener((prev) => [...prev, newToast]));
  return id;
};

const removeToast = (id) => {
  listeners.forEach((listener) => listener((prev) => prev.filter((t) => t.id !== id)));
};

export function useToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const index = listeners.indexOf(setToasts);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const toast = useCallback((options) => {
    const id = addToast(options);
    if (options.duration !== 0) {
      setTimeout(() => removeToast(id), options.duration || TOAST_DURATION);
    }
    return id;
  }, []);

  const dismiss = useCallback((id) => removeToast(id), []);

  return { toasts, toast, dismiss };
}

export function ToastProvider({ children }) {
  const { toasts, dismiss } = useToast();

  return (
    <>
      {children}
      <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </>
  );
}

function Toast({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(handleDismiss, toast.duration || TOAST_DURATION);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const variantClasses = {
    default: 'toast-default',
    success: 'toast-success',
    error: 'toast-error',
    warning: 'toast-warning',
    info: 'toast-info',
  };

  return (
    <div
      className={`toast ${variantClasses[t.variant || 'default']} ${exiting ? 'toast-exiting' : ''}`}
      role="alert"
    >
      <div className="toast-icon">
        {t.icon || (
          toast.variant === 'success' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
        )}
        {toast.variant === 'error' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        }
        {toast.variant === 'warning' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        }
        {toast.variant === 'info' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        }
      </div>
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        {toast.message && <div className="toast-message">{toast.message}</div>}
      </div>
      <button
        className="toast-close"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export const toast = {
  success: (title, message, options = {}) => ({ title, message, variant: 'success', ...options }),
  error: (title, message, options = {}) => ({ title, message, variant: 'error', ...options }),
  warning: (title, message, options = {}) => ({ title, message, variant: 'warning', ...options }),
  info: (title, message, options = {}) => ({ title, message, variant: 'info', ...options }),
  default: (title, message, options = {}) => ({ title, message, variant: 'default', ...options }),
};