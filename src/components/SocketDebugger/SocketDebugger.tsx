import React, { useEffect, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import './SocketDebugger.scss';

interface SocketDebuggerProps {
  visible?: boolean;
}

/**
 * Componente de debug para monitorear el estado del socket en tiempo real
 */
const SocketDebugger: React.FC<SocketDebuggerProps> = ({ visible = false }) => {
  const { socket, isConnected } = useSocket();
  const [logs, setLogs] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(!visible);

  useEffect(() => {
    if (!socket) return;

    const addLog = (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [...prev.slice(-9), `[${timestamp}] ${message}`]);
    };

    const handleConnect = () => addLog('✅ Conectado');
    const handleDisconnect = (reason: string) =>
      addLog(`❌ Desconectado: ${reason}`);
    const handleError = (error: any) =>
      addLog(`🚨 Error: ${error.message || error}`);
    const handleReconnectAttempt = (attempt: number) =>
      addLog(`🔄 Reintento #${attempt}`);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);
    socket.on('reconnect_attempt', handleReconnectAttempt);

    // Log inicial
    addLog(
      `🔍 Estado inicial: ${socket.connected ? 'Conectado' : 'Desconectado'}`
    );

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);
      socket.off('reconnect_attempt', handleReconnectAttempt);
    };
  }, [socket]);

  const handleForceReconnect = () => {
    if (socket) {
      socket.disconnect();
      setTimeout(() => socket.connect(), 100);
    }
  };

  const clearLogs = () => setLogs([]);

  if (!visible) return null;

  return (
    <div
      className={`socket-debugger ${isMinimized ? 'socket-debugger--minimized' : ''}`}
    >
      <div className="socket-debugger__header">
        <span className="socket-debugger__title">🔌 Socket Debug</span>
        <div className="socket-debugger__status">
          <span
            className={`socket-debugger__indicator ${isConnected ? 'connected' : 'disconnected'}`}
          >
            {isConnected ? '🟢' : '🔴'}
          </span>
          <span className="socket-debugger__status-text">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        <button
          className="socket-debugger__minimize"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {isMinimized ? '📈' : '📉'}
        </button>
      </div>

      {!isMinimized && (
        <div className="socket-debugger__content">
          <div className="socket-debugger__info">
            <div>
              <strong>Estado:</strong>{' '}
              {socket?.connected ? 'Conectado' : 'Desconectado'}
            </div>
            <div>
              <strong>ID:</strong> {socket?.id || 'N/A'}
            </div>
            <div>
              <strong>Ready State:</strong>{' '}
              {socket ? (socket.connected ? 'OPEN' : 'CONNECTING') : 'N/A'}
            </div>
          </div>

          <div className="socket-debugger__logs">
            <div className="socket-debugger__logs-header">
              <span>📋 Logs</span>
              <button onClick={clearLogs} className="socket-debugger__clear">
                🗑️
              </button>
            </div>
            <div className="socket-debugger__logs-content">
              {logs.map((log, index) => (
                <div key={index} className="socket-debugger__log">
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="socket-debugger__log socket-debugger__log--empty">
                  No hay logs aún...
                </div>
              )}
            </div>
          </div>

          <div className="socket-debugger__actions">
            <button
              onClick={handleForceReconnect}
              className="socket-debugger__button"
            >
              🔄 Forzar Reconexión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocketDebugger;
