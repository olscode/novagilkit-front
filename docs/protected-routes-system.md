# Sistema de Protección de Rutas y Componentes

Este documento describe el sistema implementado para proteger rutas y componentes cuando el servicio Socket.IO no está disponible.

## 🔧 Componentes Implementados

### 1. Hook `useSocket` y `useSocketConnection`

**Ubicación:** `src/hooks/useSocket.ts`

Hooks personalizados para verificar el estado de conexión del socket:

- `useSocketConnection()`: Retorna `boolean` indicando si hay conexión
- `useSocket()`: Retorna el socket y el estado de conexión

### 2. Componente `ProtectedRoute`

**Ubicación:** `src/components/ProtectedRoute/ProtectedRoute.tsx`

Protege rutas completas verificando la conexión del socket.

**Props:**

- `children`: Contenido a proteger
- `redirectTo`: Ruta de redirección (por defecto `/`)
- `showMessage`: Mostrar mensaje en lugar de redirigir

**Uso:**

```tsx
<ProtectedRoute showMessage={true}>
  <CreateRoomForm />
</ProtectedRoute>
```

### 3. Componente `ProtectedButton`

**Ubicación:** `src/components/ProtectedButton/ProtectedButton.tsx`

Botón que se deshabilita automáticamente cuando no hay conexión.

**Props:**

- `variant`: 'primary' | 'secondary' | 'danger'
- `size`: 'small' | 'medium' | 'large'
- `disabled`: Deshabilitar manualmente
- `showTooltip`: Mostrar tooltip informativo
- `onClick`: Función de click

**Características:**

- Se deshabilita automáticamente sin conexión
- Muestra icono de advertencia ⚠️
- Tooltip informativo
- Animación shimmer cuando está desconectado
- Adapta colores al tema del sistema

## 🛣️ Rutas Protegidas

Las siguientes rutas ahora están protegidas en `App.tsx`:

- `/planning-votes/createRoom` - Crear sala
- `/planning-votes/joinRoom` - Unirse a sala
- `/planning-votes/room/:roomId` - Sala de planning votes

Todas muestran un mensaje informativo cuando no hay conexión en lugar de redirigir.

## 🎨 Integración Visual

### Tema y Colores

- Usa variables CSS existentes del sistema de temas
- Se adapta automáticamente a modo claro/oscuro
- Consistente con el diseño actual

### Indicadores Visuales

- **Botón desconectado**: Color warning con animación shimmer
- **Icono de advertencia**: ⚠️ visible cuando no hay conexión
- **Tooltip informativo**: Explica por qué está deshabilitado
- **Mensaje de ruta**: Pantalla completa con información

## 🌍 Traducciones

Añadidas en todos los idiomas soportados:

**Claves:**

- `connectionStatus.serviceUnavailable`
- `connectionStatus.retryingConnection`
- `protectedRoute.connectionRequired`

**Idiomas:**

- Español (es)
- Inglés (en)
- Holandés (nl)
- Polaco (pl)

## 📖 Storybook

Creadas historias completas para:

- `ConnectionStatus.stories.tsx`
- `ProtectedButton.stories.tsx`
- `ProtectedRoute.stories.tsx`

Incluyen ejemplos de todos los estados y configuraciones.

## 🔄 Flujo de Funcionamiento

1. **Socket conectado**: Todo funciona normalmente
2. **Socket desconectado**:
   - Aparece notificación global en top
   - Botones protegidos se deshabilitan con indicadores visuales
   - Rutas protegidas muestran mensaje informativo
   - Sistema intenta reconectar automáticamente
3. **Reconexión exitosa**: Todo vuelve a la normalidad automáticamente

## 🎯 Beneficios

- **UX mejorada**: Usuario siempre sabe el estado de conexión
- **Prevención de errores**: No puede acceder a funcionalidades que requieren socket
- **Información clara**: Mensajes descriptivos sobre el estado
- **Automático**: No requiere intervención manual
- **Consistente**: Misma experiencia en toda la aplicación
- **Accesible**: Tooltips y mensajes informativos
