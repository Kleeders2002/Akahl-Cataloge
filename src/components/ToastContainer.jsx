/**
 * Componente: ToastContainer
 *
 * Contenedor que muestra todas las notificaciones activas
 * Se debe colocar en el nivel superior de la aplicación
 */

import { useState, useEffect } from 'react';
import Toast from './Toast';
import { toastListeners } from '../utils/toastManager';

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (newToast) => {
      setToasts(prev => {
        if (prev.some(t => t.id === newToast.id)) return prev;
        return [...prev, newToast];
      });
    };

    // Agregar listener al array global
    toastListeners.push(listener);

    // Cleanup: remover listener del array global
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
