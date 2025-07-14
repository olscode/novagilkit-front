# 🔌 Sistema de Conexión y Protección Socket.IO con Redux

## 📋 Descripción General

Este sistema proporciona una experiencia de usuario fluida y profesional para manejar la conectividad con el servidor Socket.IO. Incluye protección automática de rutas y componentes, reconexión inteligente, y feedback visual claro sobre el estado de conexión. **Migrado a Redux para una arquitectura más robusta y escalable.**

## 🏗️ Arquitectura del Sistema

### Componentes Principales

- **`SocketContext`**: Proveedor que expone la instancia del Socket.IO
- **`Redux Store`**: Maneja todo el estado de conexión (isConnected, connectionAttempts, etc.)
- **`ConnectionStatus`**: Notificación superior que indica estado de desconexión
- **`ProtectedRoute`**: Wrapper que protege rutas completas
- **`ProtectedCard`**: Tarjetas que se deshabilitan sin conexión
- **`ProtectedButton`**: Botones que se deshabilitan sin conexión
- **`ConnectionHelper`**: Herramientas de diagnóstico y recuperación
- **`SocketDebugger`**: Panel de debug para desarrollo
- **Hooks**: `useSocket()`, `useSocketConnection()`, y hooks específicos de Redux

### 🔄 Nueva Arquitectura Redux

```typescript
// Estado de conexión centralizado en Redux
interface SocketState {
  isConnected: boolean;
  connectionAttempts: number;
  lastConnectionError: string | null;
  reconnectionInProgress: boolean;
}

// Acciones disponibles
-socketConnected() -
  socketDisconnected(reason) -
  socketConnectionError(message) -
  socketReconnectionAttempt(attempt) -
  socketReconnectionFailed() -
  resetSocketConnectionAttempts();
```

## ⚙️ Configuración del Socket

```typescript
// src/SocketContext.tsx
const socket: Socket = io('http://localhost:3000', {
  reconnectionAttempts: 5, // 5 intentos automáticos
  reconnectionDelay: 1000, // 1 segundo entre intentos
  autoConnect: false, // Control manual de conexión
});
```

### Parámetros Configurables

- **reconnectionAttempts**: Número de intentos automáticos (actual: 5)
- **reconnectionDelay**: Tiempo entre intentos en ms (actual: 1000ms)
- **autoConnect**: Si conecta automáticamente al crear (actual: false)

## 🔄 Flujo de Reconexión

### Fase 1: Reconexión Automática (0-5 segundos)

```
🔄 Intento #1 (1s) → 🔄 Intento #2 (2s) → 🔄 Intento #3 (3s) → 🔄 Intento #4 (4s) → 🔄 Intento #5 (5s)
```

### Fase 2: Intervención Manual (después de 5s)

Si fallan todos los intentos automáticos:

- ✅ Aparece `ConnectionHelper` con herramientas de recuperación
- ✅ Usuario puede forzar reconexión manualmente
- ✅ Opciones para diagnosticar problemas

### Fase 3: Reconexión Exitosa

```
✅ Socket detecta servidor → ✅ Estado se actualiza → ✅ UI se restaura automáticamente
```

## 🎯 Estados del Sistema

### 🟢 Estado Conectado

- ✅ Notificación superior NO visible
- ✅ Tarjetas completamente funcionales con animaciones
- ✅ Botones clickeables normalmente
- ✅ Rutas protegidas cargan sin restricciones
- ✅ Todas las funcionalidades disponibles

### 🟡 Estado Reconectando

- ⚠️ Notificación superior: "Servicio no disponible - Reintentando conexión..."
- ⚠️ Tarjetas muestran overlay al hacer hover
- ⚠️ Botones deshabilitados con indicador visual
- ⚠️ Rutas protegidas muestran página de espera
- 🔄 Intentos automáticos cada 1 segundo

### 🔴 Estado Desconectado (después de 5 intentos)

- ❌ Notificación superior persistente
- ❌ Tarjetas completamente deshabilitadas
- ❌ Botones no funcionales con tooltips explicativos
- ❌ Rutas protegidas muestran `ConnectionHelper`
- 🛠️ Herramientas manuales de recuperación disponibles

## 🛡️ Componentes Protegidos

### ProtectedRoute

```tsx
<ProtectedRoute showMessage={true}>
  <CreateRoomForm />
</ProtectedRoute>
```

**Props:**

- `showMessage`: Mostrar página de error vs redirigir
- `redirectTo`: Ruta de redirección (default: '/')

**Rutas Protegidas Actuales:**

- `/poker-planning/createRoom`
- `/poker-planning/joinRoom`
- `/poker-planning/room/:roomId`

### ProtectedCard

```tsx
<ProtectedCard
  icon="✨"
  title="Crear Sala"
  description="Descripción de la funcionalidad"
  onClick={() => navigate('/ruta')}
  variant="primary"
/>
```

**Características:**

- Mantiene diseño original de las tarjetas
- Overlay con blur cuando no hay conexión
- Indicadores visuales al hacer hover
- Tooltip explicativo

### ProtectedButton

```tsx
<ProtectedButton variant="primary" size="large" onClick={handleClick}>
  Texto del Botón
</ProtectedButton>
```

**Características:**

- Se deshabilita automáticamente
- Cambia color a warning cuando desconectado
- Icono de advertencia ⚠️
- Tooltip informativo

## 🌍 Internacionalización

### Claves de Traducción Implementadas

```json
{
  "connectionStatus": {
    "serviceUnavailable": "Servicio no disponible",
    "retryingConnection": "Reintentando conexión..."
  },
  "protectedRoute": {
    "connectionRequired": "Se requiere conexión al servicio..."
  },
  "connectionHelper": {
    "troubleshooting": "Solución de Problemas",
    "checkServer": "Verifica que el servidor esté corriendo en {{url}}",
    "verifyPort": "Asegúrate de que el puerto 3000 esté disponible",
    "refreshPage": "Recarga la página para intentar reconectar",
    "checkHealth": "Verificar Servidor",
    "refresh": "Recargar Página"
  }
}
```

**Idiomas Soportados:**

- 🇪🇸 Español (es)
- 🇺🇸 Inglés (en)
- 🇳🇱 Holandés (nl)
- 🇵🇱 Polaco (pl)

## 🔧 Herramientas de Debug

### SocketDebugger (Solo Desarrollo)

```tsx
<SocketDebugger visible={true} />
```

**Funcionalidades:**

- 📊 Estado en tiempo real
- 📋 Logs de eventos
- 🔄 Forzar reconexión manual
- 📈 Minimizable/Expandible
- 🎯 Información detallada del socket

### Logs de Consola

```
🔌 Socket conectado exitosamente
🔌 Socket desconectado: transport close
🔄 Intento de reconexión #1
📊 Estado de conexión: { connected: true, socketConnected: true, connectionAttempts: 0 }
```

## 🎨 Integración Visual

### Sistema de Temas

- ✅ Adapta automáticamente a modo claro/oscuro
- ✅ Usa variables CSS del sistema existente
- ✅ Animaciones consistentes con el diseño
- ✅ Colores de estado estándar (success, warning, error)

### Indicadores Visuales

- 🟢 **Verde**: Conectado y funcional
- 🟡 **Naranja**: Reconectando (color warning)
- 🔴 **Rojo**: Error/Desconectado
- ⚠️ **Icono**: Advertencia de estado

## 🚀 Implementación en Nuevos Componentes

### Para Proteger una Nueva Ruta

```tsx
<Route
  path="/nueva-ruta"
  element={
    <ProtectedRoute showMessage={true}>
      <NuevoComponente />
    </ProtectedRoute>
  }
/>
```

### Para Crear un Botón Protegido

```tsx
import ProtectedButton from './components/ProtectedButton/ProtectedButton';

<ProtectedButton variant="primary" onClick={handleAction}>
  Nueva Acción
</ProtectedButton>;
```

### Para Usar el Hook de Conexión (Arquitectura Redux)

```tsx
// Hook principal que incluye socket e estado
import { useSocket } from './hooks/useSocket';

const MiComponente = () => {
  const { socket, isConnected, connectionAttempts, lastError, isReconnecting } =
    useSocket();

  return (
    <div>
      <p>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</p>
      <p>Intentos: {connectionAttempts}</p>
      {lastError && <p>Error: {lastError}</p>}
      {isReconnecting && <p>Reconectando...</p>}
    </div>
  );
};
```

```tsx
// Hook específico solo para estado de conexión
import { useSocketConnection } from './hooks/useSocket';

const MiComponente = () => {
  const isConnected = useSocketConnection();

  return <div>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</div>;
};
```

```tsx
// Hooks específicos de Redux para casos avanzados
import {
  useIsSocketConnected,
  useSocketConnectionAttempts,
  useSocketLastError,
  useIsReconnectionInProgress,
} from './hooks/useSocketConnection';

const AdvancedComponent = () => {
  const isConnected = useIsSocketConnected();
  const attempts = useSocketConnectionAttempts();
  const error = useSocketLastError();
  const isReconnecting = useIsReconnectionInProgress();

  return (
    <div className="connection-status-advanced">
      <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
      </div>
      {attempts > 0 && <div>Intentos de reconexión: {attempts}</div>}
      {error && <div className="error">⚠️ {error}</div>}
      {isReconnecting && <div className="reconnecting">🔄 Reconectando...</div>}
    </div>
  );
};
```

## 🎯 Hooks Disponibles (Nueva Arquitectura Redux)

### Hooks Principales

- **`useSocket()`**: Socket + estado completo de conexión
- **`useSocketConnection()`**: Solo booleano de conexión (más eficiente)

### Hooks Específicos de Redux

- **`useIsSocketConnected()`**: Estado de conexión
- **`useSocketConnectionAttempts()`**: Número de intentos de reconexión
- **`useSocketLastError()`**: Último error de conexión
- **`useIsReconnectionInProgress()`**: Si hay reconexión en progreso
- **`useSocketConnectionState()`**: Estado completo del socket

## 🔍 Resolución de Problemas

### Problema: Socket no conecta

**Solución:**

1. Verificar que servidor esté en puerto 3000
2. Comprobar logs en consola
3. Usar `SocketDebugger` para diagnóstico
4. Verificar configuración de CORS

### Problema: Reconexión no funciona

**Solución:**

1. Revisar `reconnectionAttempts` en configuración
2. Verificar eventos en SocketDebugger
3. Comprobar que servidor acepta reconexiones

### Problema: UI no se actualiza

**Solución:**

1. Verificar que componente usa `useSocketConnection()`
2. Comprobar que no hay errores en console
3. Revisar que eventos del socket se disparan

## 📝 Comandos de Desarrollo

### Script de Prueba de Conexión

```bash
# Probar conexión al servidor
node server-test.js
```

### Ejemplo de Servidor Mínimo

```javascript
// server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173' },
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
});

server.listen(3000);
```

## ✨ Beneficios del Sistema

- ✅ **Experiencia de usuario fluida**: Transiciones automáticas sin interrupciones
- ✅ **Feedback claro**: Usuario siempre sabe el estado del sistema
- ✅ **Recuperación automática**: Reconexión sin intervención manual
- ✅ **Escalabilidad**: Fácil de extender a nuevos componentes
- ✅ **Mantenibilidad**: Código centralizado y bien organizado
- ✅ **Internacionalización**: Soporte multi-idioma completo
- ✅ **Debug amigable**: Herramientas para desarrollo y diagnóstico

---

_Documentación creada para Nova Tools - Sistema de Protección Socket.IO v1.0_
