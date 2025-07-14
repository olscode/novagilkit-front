import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../hooks/useSocket';
import './ProtectedButton.scss';

interface ProtectedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

/**
 * Componente de botón que se deshabilita cuando no hay conexión al socket
 */
const ProtectedButton: React.FC<ProtectedButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'medium',
  showTooltip = true,
}) => {
  const { t } = useTranslation();
  const { isConnected } = useSocket();

  const isDisabled = disabled || !isConnected;

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick();
    }
  };

  const buttonClasses = [
    'protected-button',
    `protected-button--${variant}`,
    `protected-button--${size}`,
    isDisabled ? 'protected-button--disabled' : '',
    !isConnected ? 'protected-button--disconnected' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="protected-button-wrapper">
      <button
        className={buttonClasses}
        onClick={handleClick}
        disabled={isDisabled}
        title={
          !isConnected && showTooltip
            ? t('protectedRoute.connectionRequired')
            : undefined
        }
      >
        {!isConnected && (
          <span className="protected-button__connection-icon">⚠️</span>
        )}
        {children}
      </button>
      {!isConnected && showTooltip && (
        <div className="protected-button__tooltip">
          {t('connectionStatus.serviceUnavailable')}
        </div>
      )}
    </div>
  );
};

export default ProtectedButton;
