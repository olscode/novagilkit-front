import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../hooks/useSocket';
import './ProtectedCard.scss';

interface ProtectedCardProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
}

/**
 * Componente de tarjeta que se deshabilita cuando no hay conexión al socket
 * Mantiene el diseño original de las tarjetas pero añade protección
 */
const ProtectedCard: React.FC<ProtectedCardProps> = ({
  icon,
  title,
  description,
  onClick,
  disabled = false,
  className = '',
  variant = 'primary',
}) => {
  const { t } = useTranslation();
  const { isConnected } = useSocket();

  const isDisabled = disabled || !isConnected;

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick();
    }
  };

  const cardClasses = [
    'protected-card',
    `protected-card--${variant}`,
    isDisabled ? 'protected-card--disabled' : '',
    !isConnected ? 'protected-card--disconnected' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      title={!isConnected ? t('protectedRoute.connectionRequired') : undefined}
    >
      {!isConnected && (
        <div className="protected-card__overlay">
          <div className="protected-card__warning">
            <div className="protected-card__warning-icon">⚠️</div>
            <div className="protected-card__warning-text">
              {t('connectionStatus.serviceUnavailable')}
            </div>
          </div>
        </div>
      )}

      <div className="protected-card__content">
        <div className="protected-card__icon">{icon}</div>
        <div className="protected-card__title">{title}</div>
        <div className="protected-card__description">{description}</div>
      </div>
    </div>
  );
};

export default ProtectedCard;
