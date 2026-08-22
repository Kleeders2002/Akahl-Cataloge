/**
 * Hook: useToast
 *
 * Hook personalizado para mostrar notificaciones toast
 * Uso:
 *   const { showSuccess, showError, showWarning, showInfo } = useToast();
 *
 *   showSuccess('Brand created successfully!');
 *   showError('Error creating brand');
 *   showWarning('Are you sure?');
 *   showInfo('Processing...');
 */

import { useState, useCallback } from 'react';
import { TOAST_TYPES } from '../components/Toast';

let toastListeners = [];

// Función para mostrar un toast globalmente
export const showToast = (toast) => {
  const id = Date.now() + Math.random();
  const newToast = { id, ...toast };

  // Notificar a todos los listeners
  toastListeners.forEach(listener => listener(newToast));

  return id;
};

// Atajos para diferentes tipos de toast
export const toast = {
  success: (message, options = {}) => showToast({ type: TOAST_TYPES.SUCCESS, message, ...options }),
  error: (message, options = {}) => showToast({ type: TOAST_TYPES.ERROR, message, ...options }),
  warning: (message, options = {}) => showToast({ type: TOAST_TYPES.WARNING, message, ...options }),
  info: (message, options = {}) => showToast({ type: TOAST_TYPES.INFO, message, ...options }),
};

function useToast() {
  const [toasts, setToasts] = useState([]);

  // Registrar listener
  useCallback((listener) => {
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showSuccess = useCallback((message, options = {}) => {
    return toast.success(message, options);
  }, []);

  const showError = useCallback((message, options = {}) => {
    return toast.error(message, options);
  }, []);

  const showWarning = useCallback((message, options = {}) => {
    return toast.warning(message, options);
  }, []);

  const showInfo = useCallback((message, options = {}) => {
    return toast.info(message, options);
  }, []);

  // Escuchar nuevos toasts
  useCallback(() => {
    const listener = (newToast) => {
      setToasts(prev => {
        // Evitar duplicados por id
        if (prev.some(t => t.id === newToast.id)) return prev;
        return [...prev, newToast];
      });
    };

    toastListeners.push(listener);

    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  return {
    toasts,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    toast,
  };
}

export default useToast;
