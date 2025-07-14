import React, { useEffect, useState } from 'react';
import './Toast.scss';

export interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
  icon?: string;
  isVisible: boolean;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 4000,
  onClose,
  icon,
  isVisible,
}) => {
  const [visible, setVisible] = useState(isVisible);

  // Predeterminados iconos para cada tipo
  const defaultIcons = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
  };

  useEffect(() => {
    setVisible(isVisible);

    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <div className={`toast-container ${visible ? 'visible' : ''}`}>
      <div className={`toast toast-${type}`}>
        <div className="toast-icon">{icon || defaultIcons[type]}</div>
        <div className="toast-content">{message}</div>
        <button
          className="toast-close"
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
          aria-label="Cerrar notificación"
        >
          &times;
        </button>

        {/* Barra de progreso para indicar cuánto tiempo queda */}
        {duration > 0 && (
          <div
            className="toast-progress"
            style={{ animationDuration: `${duration}ms` }}
          />
        )}
      </div>
    </div>
  );
};

export default Toast;
