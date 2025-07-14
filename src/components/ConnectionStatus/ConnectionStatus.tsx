import React from 'react';
import { useTranslation } from 'react-i18next';
import './ConnectionStatus.scss';

interface ConnectionStatusProps {
  isConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  const { t } = useTranslation();

  if (isConnected) {
    return null; // No mostrar nada si está conectado
  }

  return (
    <div className="connection-status">
      <div className="connection-status__content">
        <div className="connection-status__icon">⚠️</div>
        <div className="connection-status__message">
          <span className="connection-status__title">
            {t('connectionStatus.serviceUnavailable')}
          </span>
          <span className="connection-status__description">
            {t('connectionStatus.retryingConnection')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
