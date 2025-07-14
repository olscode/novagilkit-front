import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { useSocket } from '../../hooks/useSocket';
import ConnectionHelper from '../ConnectionHelper/ConnectionHelper';
import './ProtectedRoute.scss';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  showMessage?: boolean;
}

/**
 * Componente que protege rutas verificando la conexión del socket
 * Si no hay conexión, puede redirigir o mostrar un mensaje
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/',
  showMessage = false,
}) => {
  const { t } = useTranslation();
  const { isConnected } = useSocket();

  if (!isConnected) {
    if (showMessage) {
      return (
        <div className="protected-route-message">
          <div className="protected-route-message__content">
            <div className="protected-route-message__icon">🔌</div>
            <h2 className="protected-route-message__title">
              {t('connectionStatus.serviceUnavailable')}
            </h2>
            <p className="protected-route-message__description">
              {t('protectedRoute.connectionRequired')}
            </p>
            <p className="protected-route-message__retry">
              {t('connectionStatus.retryingConnection')}
            </p>
            <ConnectionHelper />
          </div>
        </div>
      );
    }

    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
