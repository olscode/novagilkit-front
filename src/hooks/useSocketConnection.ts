import { useAppSelector } from '../redux/hooks';
import {
  selectIsReconnectionInProgress,
  selectIsSocketConnected,
  selectSocketConnectionAttempts,
  selectSocketLastError,
  selectSocketState,
} from '../redux/reducers';

/**
 * Hooks específicos para el estado de conexión del socket basados en Redux
 * Estos hooks proporcionan un acceso directo y tipado al estado de conexión
 *
 * 💡 Nota: Estos hooks son wrappers simples para mejorar la DX (Developer Experience).
 * Si prefieres menos abstracción, puedes usar directamente:
 * - useAppSelector(selectIsSocketConnected) en lugar de useIsSocketConnected()
 * - useAppSelector(selectSocketConnectionAttempts) en lugar de useSocketConnectionAttempts()
 * etc.
 *
 * Los hooks específicos ofrecen:
 * ✅ API más limpia y semántica
 * ✅ Menos imports en componentes
 * ✅ Facilidad de refactoring futuro
 * ✅ Consistencia con useSocket() y useSocketConnection()
 */

/**
 * Hook para obtener el estado de conexión del socket
 * @returns {boolean} true si el socket está conectado
 */
export const useIsSocketConnected = (): boolean => {
  return useAppSelector(selectIsSocketConnected);
};

/**
 * Hook para obtener el número de intentos de reconexión
 * @returns {number} número de intentos de reconexión
 */
export const useSocketConnectionAttempts = (): number => {
  return useAppSelector(selectSocketConnectionAttempts);
};

/**
 * Hook para obtener el último error de conexión
 * @returns {string | null} mensaje del último error o null
 */
export const useSocketLastError = (): string | null => {
  return useAppSelector(selectSocketLastError);
};

/**
 * Hook para verificar si hay una reconexión en progreso
 * @returns {boolean} true si hay una reconexión en progreso
 */
export const useIsReconnectionInProgress = (): boolean => {
  return useAppSelector(selectIsReconnectionInProgress);
};

/**
 * Hook para obtener todo el estado de conexión del socket
 * @returns {SocketState} estado completo de la conexión
 */
export const useSocketConnectionState = () => {
  return useAppSelector(selectSocketState);
};
