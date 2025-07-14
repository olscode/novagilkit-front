import { createContext, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import ConnectionStatus from './components/ConnectionStatus/ConnectionStatus';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import {
  selectIsSocketConnected,
  socketConnected,
  socketConnectionError,
  socketDisconnected,
  socketReconnectionAttempt,
  socketReconnectionFailed,
} from './redux/reducers';

// Crear socket una vez fuera del componente para evitar reconexiones innecesarias
const socket: Socket = io('http://localhost:3000', {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false, // Inicialmente no conectar, lo haremos en el useEffect
});

// Tipo para el contexto - ahora solo exposé el socket, el estado viene de Redux
interface SocketContextType {
  socket: Socket;
}

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined
);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector(selectIsSocketConnected);

  useEffect(() => {
    // Manejadores de eventos para el socket
    const handleConnect = () => {
      console.log('🔌 Socket conectado exitosamente');
      dispatch(socketConnected());
    };

    const handleDisconnect = (reason: string) => {
      console.log('🔌 Socket desconectado:', reason);
      dispatch(socketDisconnected(reason));
    };

    const handleError = (error: Error) => {
      console.error('🔌 Error de socket:', error);
      dispatch(socketConnectionError(error.message));
    };

    const handleReconnectAttempt = (attempt: number) => {
      console.log(`🔄 Intento de reconexión #${attempt}`);
      dispatch(socketReconnectionAttempt(attempt));
    };

    const handleReconnectError = (error: Error) => {
      console.error('🔄 Error en reconexión:', error);
      dispatch(socketConnectionError(error.message));
    };

    const handleReconnectFailed = () => {
      console.error('🔄 Reconexión falló después de todos los intentos');
      dispatch(socketReconnectionFailed());
    };

    // Registrar manejadores de eventos
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('reconnect_error', handleReconnectError);
    socket.on('reconnect_failed', handleReconnectFailed);

    // Verificar estado inicial
    if (socket.connected) {
      console.log('🔌 Socket ya estaba conectado');
      dispatch(socketConnected());
    } else {
      console.log('🔌 Iniciando conexión del socket...');
      socket.connect();
    }

    // Función de limpieza
    return () => {
      console.log('🧹 Limpiando manejadores de eventos del socket');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('reconnect_error', handleReconnectError);
      socket.off('reconnect_failed', handleReconnectFailed);

      // No desconectamos el socket para mantener la conexión entre componentes
      // socket.disconnect(); - Esto causaría problemas con las rutas
    };
  }, []); // Sin dependencias para que solo se ejecute al montar/desmontar

  // Debug: Log del estado actual desde Redux
  useEffect(() => {
    console.log('📊 Estado de conexión:', {
      isConnected,
      socketConnected: socket.connected,
    });
  }, [isConnected]);

  return (
    <>
      <ConnectionStatus isConnected={isConnected} />
      <SocketContext.Provider value={{ socket }}>
        {children}
      </SocketContext.Provider>
    </>
  );
};

export default SocketContext;
