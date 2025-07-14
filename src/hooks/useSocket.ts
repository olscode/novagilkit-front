import { useContext } from 'react';
import { SocketContext } from '../SocketContext';
import {
  useIsReconnectionInProgress,
  useIsSocketConnected,
  useSocketConnectionAttempts,
  useSocketLastError,
} from './useSocketConnection';

/**
 * Hook personalizado para obtener el socket y su estado de conexión desde Redux
 * @returns {{ socket: Socket, isConnected: boolean, connectionAttempts: number, lastError: string | null, isReconnecting: boolean }}
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  const isConnected = useIsSocketConnected();
  const connectionAttempts = useSocketConnectionAttempts();
  const lastError = useSocketLastError();
  const isReconnecting = useIsReconnectionInProgress();

  if (!context) {
    console.warn('useSocket debe usarse dentro de un SocketProvider');
    return {
      socket: undefined,
      isConnected: false,
      connectionAttempts: 0,
      lastError: null,
      isReconnecting: false,
    };
  }

  return {
    socket: context.socket,
    isConnected,
    connectionAttempts,
    lastError,
    isReconnecting,
  };
};
