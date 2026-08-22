/**
 * Toast Manager - Sistema centralizado de notificaciones
 *
 * Este archivo gestiona el sistema de notificaciones global
 */

// Tipos de toast (definidos localmente para evitar dependencias circulares)
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Variable global para listeners
export let toastListeners = [];

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

export default toast;
