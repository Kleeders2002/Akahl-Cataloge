/**
 * Hook: useToast
 *
 * Hook personalizado para mostrar notificaciones toast
 * Uso:
 *   import { toast } from '../hooks/useToast';
 *
 *   toast.success('Success message');
 *   toast.error('Error message');
 */

// Reexportar desde toastManager
export { toast, toastListeners } from '../utils/toastManager';
export { default } from '../utils/toastManager';
