# 🔄 Guía de Migración: Context a Redux para Socket State

## 📚 Contexto de la Migración

Esta guía documenta el proceso paso a paso para migrar el estado de conexión del Socket.IO de React Context a Redux, con el objetivo de centralizar el estado y mejorar la arquitectura de la aplicación.

## 🎯 Objetivos de la Migración

1. **Centralizar estado**: Una única fuente de verdad para conexión
2. **Mejorar debugging**: Aprovechar Redux DevTools
3. **Optimizar performance**: Selectores memoizados
4. **Facilitar testing**: Estado predecible y mockeable
5. **Preparar escalabilidad**: Middleware y funcionalidades avanzadas

## 📋 Pre-requisitos

- ✅ Redux ya configurado en la aplicación
- ✅ React-Redux instalado y configurado
- ✅ SocketContext existente funcionando
- ✅ Hooks de socket en uso

## 🚀 Pasos de Migración

### Paso 1: Actualizar Redux Store

#### 1.1 Definir Interface del Estado

```typescript
// src/redux/reducers.ts
export interface SocketState {
  isConnected: boolean;
  connectionAttempts: number;
  lastConnectionError: string | null;
  reconnectionInProgress: boolean;
}
```

#### 1.2 Agregar al Estado Global

```typescript
interface State {
  room: Room;
  profile: User;
  socket: SocketState; // ← Nueva línea
}
```

#### 1.3 Actualizar Initial State

```typescript
const initialState: State = {
  room: {
    /* ... */
  },
  profile: {
    /* ... */
  },
  socket: {
    isConnected: false,
    connectionAttempts: 0,
    lastConnectionError: null,
    reconnectionInProgress: false,
  },
};
```

### Paso 2: Crear Acciones Redux

#### 2.1 Definir Reducers para Socket

```typescript
// En rootReducer.reducers:
socketConnected: (state) => {
  state.socket.isConnected = true;
  state.socket.connectionAttempts = 0;
  state.socket.lastConnectionError = null;
  state.socket.reconnectionInProgress = false;
},

socketDisconnected: (state, action: PayloadAction<string | undefined>) => {
  state.socket.isConnected = false;
  state.socket.lastConnectionError = action.payload || null;
  state.socket.reconnectionInProgress = false;
},

socketConnectionError: (state, action: PayloadAction<string>) => {
  state.socket.isConnected = false;
  state.socket.lastConnectionError = action.payload;
  state.socket.reconnectionInProgress = false;
},

socketReconnectionAttempt: (state, action: PayloadAction<number>) => {
  state.socket.connectionAttempts = action.payload;
  state.socket.reconnectionInProgress = true;
},

socketReconnectionFailed: (state) => {
  state.socket.isConnected = false;
  state.socket.reconnectionInProgress = false;
},

resetSocketConnectionAttempts: (state) => {
  state.socket.connectionAttempts = 0;
},
```

#### 2.2 Exportar Acciones

```typescript
export const {
  // ... acciones existentes
  socketConnected,
  socketDisconnected,
  socketConnectionError,
  socketReconnectionAttempt,
  socketReconnectionFailed,
  resetSocketConnectionAttempts,
} = rootReducer.actions;
```

### Paso 3: Crear Selectores

```typescript
// Selectores básicos
export const selectSocketState = (state: State) => state.socket;
export const selectIsSocketConnected = (state: State) =>
  state.socket.isConnected;
export const selectSocketConnectionAttempts = (state: State) =>
  state.socket.connectionAttempts;
export const selectSocketLastError = (state: State) =>
  state.socket.lastConnectionError;
export const selectIsReconnectionInProgress = (state: State) =>
  state.socket.reconnectionInProgress;
```

### Paso 4: Crear Hooks Tipados para Redux

#### 4.1 Hooks Generales de Redux

```typescript
// src/redux/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

#### 4.2 Hooks Específicos para Socket

```typescript
// src/hooks/useSocketConnection.ts
import { useAppSelector } from '../redux/hooks';
import {
  selectIsSocketConnected,
  selectSocketConnectionAttempts,
  selectSocketLastError,
  selectIsReconnectionInProgress,
  selectSocketState,
} from '../redux/reducers';

export const useIsSocketConnected = (): boolean => {
  return useAppSelector(selectIsSocketConnected);
};

export const useSocketConnectionAttempts = (): number => {
  return useAppSelector(selectSocketConnectionAttempts);
};

export const useSocketLastError = (): string | null => {
  return useAppSelector(selectSocketLastError);
};

export const useIsReconnectionInProgress = (): boolean => {
  return useAppSelector(selectIsReconnectionInProgress);
};

export const useSocketConnectionState = () => {
  return useAppSelector(selectSocketState);
};
```

### Paso 5: Refactorizar SocketContext

#### 5.1 Simplificar Interface

```typescript
// ANTES
interface SocketContextType {
  socket: Socket;
  isConnected: boolean; // ← Eliminar
  connectionAttempts: number; // ← Eliminar
}

// DESPUÉS
interface SocketContextType {
  socket: Socket; // Solo la instancia
}
```

#### 5.2 Actualizar Provider

```typescript
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector(selectIsSocketConnected);

  useEffect(() => {
    // Reemplazar setState con dispatch
    const handleConnect = () => {
      console.log('🔌 Socket conectado exitosamente');
      dispatch(socketConnected()); // ← Redux
    };

    const handleDisconnect = (reason: string) => {
      console.log('🔌 Socket desconectado:', reason);
      dispatch(socketDisconnected(reason)); // ← Redux
    };

    // ... resto de handlers usando dispatch

    // Registrar handlers...
    // Cleanup...
  }, []);

  return (
    <>
      <ConnectionStatus isConnected={isConnected} />
      <SocketContext.Provider value={{ socket }}>
        {children}
      </SocketContext.Provider>
    </>
  );
};
```

### Paso 6: Actualizar Hooks Existentes

#### 6.1 Actualizar useSocket Hook

```typescript
// src/hooks/useSocket.ts
import { useContext } from 'react';
import { SocketContext } from '../SocketContext';
import {
  useIsSocketConnected,
  useSocketConnectionAttempts,
  useSocketLastError,
  useIsReconnectionInProgress,
} from './useSocketConnection';

export const useSocketConnection = (): boolean => {
  return useIsSocketConnected(); // ← Usar Redux
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  const isConnected = useIsSocketConnected(); // ← Redux
  const connectionAttempts = useSocketConnectionAttempts(); // ← Redux
  const lastError = useSocketLastError(); // ← Redux
  const isReconnecting = useIsReconnectionInProgress(); // ← Redux

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
```

### Paso 7: Actualizar Componentes

#### 7.1 Buscar y Reemplazar useContext Directo

```bash
# Buscar componentes que usan useContext directamente
grep -r "useContext(SocketContext)" src/
```

#### 7.2 Actualizar Componentes

```typescript
// ANTES en Room.tsx
const socketContext = useContext(SocketContext);
const socket = socketContext?.socket;

// DESPUÉS en Room.tsx
const { socket } = useSocket();
```

#### 7.3 Limpiar Importaciones

```typescript
// ANTES
import { useContext } from 'react';
import { SocketContext } from '../SocketContext';

// DESPUÉS
import { useSocket } from '../hooks/useSocket';
```

### Paso 8: Testing y Validación

#### 8.1 Verificar Compilación

```bash
npm run build
```

#### 8.2 Verificar Funcionalidad

1. ✅ Conexión inicial funciona
2. ✅ Reconexión automática funciona
3. ✅ Componentes protegidos funcionan
4. ✅ Estado se actualiza correctamente
5. ✅ Redux DevTools muestra eventos

#### 8.3 Testing Específico

```typescript
// Test que el estado de Redux se actualiza
describe('Socket Redux Integration', () => {
  it('updates connection state in Redux', () => {
    const store = createStore();
    store.dispatch(socketConnected());

    const state = store.getState();
    expect(state.socket.isConnected).toBe(true);
    expect(state.socket.connectionAttempts).toBe(0);
  });
});
```

## ✅ Checklist de Migración Completa

- [ ] **Redux State**: Socket state agregado al store
- [ ] **Acciones**: Todas las acciones de socket creadas
- [ ] **Selectores**: Selectores para acceso al estado
- [ ] **Hooks Redux**: Hooks tipados creados
- [ ] **Hooks Socket**: useSocket refactorizado para usar Redux
- [ ] **SocketContext**: Simplificado para solo exponer socket
- [ ] **Componentes**: Actualizados para usar nuevos hooks
- [ ] **Importaciones**: Limpiadas y actualizadas
- [ ] **Testing**: Funcionalidad verificada
- [ ] **Build**: Compilación exitosa

## 🎉 Beneficios Inmediatos Post-Migración

1. **🔍 Debugging Mejorado**: Redux DevTools disponible
2. **⚡ Performance**: Selectores memoizados, menos re-renders
3. **🧪 Testing**: Estado mockeable fácilmente
4. **📊 Consistencia**: Una fuente de verdad para conexión
5. **🚀 Escalabilidad**: Preparado para middleware y funcionalidades avanzadas

## 🔮 Próximos Pasos Recomendados

1. **Middleware de Analytics**: Tracking automático de eventos de conexión
2. **Persistencia**: Guardar historial de conexión con Redux Persist
3. **Optimistic Updates**: Para mejor UX en acciones de socket
4. **Queue Offline**: Encolar acciones cuando no hay conexión
5. **Health Monitoring**: Métricas avanzadas de conexión

Esta migración sienta las bases para una arquitectura más robusta y escalable del estado de conectividad en la aplicación.
