import React, { createContext, useContext, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Toast from './Toast';

// Tipos
interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  icon?: string;
  isVisible?: boolean;
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: Omit<ToastMessage, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: { id: string } }
  | { type: 'HIDE_TOAST'; payload: { id: string } };

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

// Creación del contexto
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Reducer para gestionar el estado
const toastReducer = (
  state: ToastMessage[],
  action: ToastAction
): ToastMessage[] => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, { ...action.payload, id: uuidv4(), isVisible: true }];
    case 'HIDE_TOAST':
      return state.map((toast) =>
        toast.id === action.payload.id ? { ...toast, isVisible: false } : toast
      );
    case 'REMOVE_TOAST':
      return state.filter((toast) => toast.id !== action.payload.id);
    default:
      return state;
  }
};

// Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    // Limit to maximum 5 toasts at once
    if (toasts.length >= 5) {
      // Remove the oldest toast first
      const oldestToast = toasts.find((t) => t.isVisible);
      if (oldestToast) {
        removeToast(oldestToast.id);
      }
    }

    dispatch({ type: 'ADD_TOAST', payload: toast });
  };

  const removeToast = (id: string) => {
    // First hide the toast with animation
    dispatch({ type: 'HIDE_TOAST', payload: { id } });

    // Then remove it from the array after animation completes
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: { id } });
    }, 500); // Match transition duration
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="toast-list">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            icon={toast.icon}
            isVisible={toast.isVisible ?? true}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Funciones para mostrar distintos tipos de notificaciones
export const useToastNotification = () => {
  const { addToast } = useToast();

  return {
    showSuccess: (message: string, options = {}) => {
      addToast({ message, type: 'success', ...options });
    },
    showInfo: (message: string, options = {}) => {
      addToast({ message, type: 'info', ...options });
    },
    showWarning: (message: string, options = {}) => {
      addToast({ message, type: 'warning', ...options });
    },
    showError: (message: string, options = {}) => {
      addToast({ message, type: 'error', ...options });
    },
  };
};
