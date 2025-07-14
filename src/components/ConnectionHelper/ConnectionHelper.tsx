import React from 'react';
import { useTranslation } from 'react-i18next';
import './ConnectionHelper.scss';

interface ConnectionHelperProps {
  serverUrl?: string;
}

/**
 * Componente helper que muestra información sobre cómo solucionar problemas de conexión
 */
const ConnectionHelper: React.FC<ConnectionHelperProps> = ({
  serverUrl = 'http://localhost:3000',
}) => {
  const { t } = useTranslation();

  const checkServerHealth = () => {
    window.open(`${serverUrl}/health`, '_blank');
  };

  return (
    <div className="connection-helper">
      <div className="connection-helper__content">
        <h3 className="connection-helper__title">
          🔧 {t('connectionHelper.troubleshooting')}
        </h3>
        <div className="connection-helper__steps">
          <div className="connection-helper__step">
            <span className="connection-helper__step-number">1</span>
            <span className="connection-helper__step-text">
              {t('connectionHelper.checkServer', { url: serverUrl })}
            </span>
          </div>
          <div className="connection-helper__step">
            <span className="connection-helper__step-number">2</span>
            <span className="connection-helper__step-text">
              {t('connectionHelper.verifyPort')}
            </span>
          </div>
          <div className="connection-helper__step">
            <span className="connection-helper__step-number">3</span>
            <span className="connection-helper__step-text">
              {t('connectionHelper.refreshPage')}
            </span>
          </div>
        </div>
        <div className="connection-helper__actions">
          <button
            className="connection-helper__button connection-helper__button--primary"
            onClick={checkServerHealth}
          >
            {t('connectionHelper.checkHealth')}
          </button>
          <button
            className="connection-helper__button connection-helper__button--secondary"
            onClick={() => window.location.reload()}
          >
            {t('connectionHelper.refresh')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionHelper;
