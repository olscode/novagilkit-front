# Guía de Solución de Problemas de Conexión

## 🔍 Diagnóstico del Problema

Cuando accedes directamente a una URL como:

```
http://localhost:5173/poker-planning/room/ef0e733c-dfe8-4e6b-8bc0-5501c60a25b5
```

Y ves el mensaje "Servicio no disponible", significa que:

1. ✅ **El sistema de protección funciona correctamente**
2. ⚠️ **El servidor Socket.IO no está corriendo o no es accesible**

## 🛠️ Soluciones

### 1. Verificar que el servidor backend esté corriendo

El frontend intenta conectarse a `http://localhost:3000`. Asegúrate de:

```bash
# Si tienes un servidor Node.js
npm start  # o el comando para iniciar tu backend

# Si usas un servidor diferente, inicia el servicio correspondiente
```

### 2. Verificar la configuración del Socket

El socket está configurado en `src/SocketContext.tsx`:

```typescript
const socket: Socket = io('http://localhost:3000', {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false,
});
```

### 3. Comprobar manualmente la conexión

Abre tu navegador y ve a:

- `http://localhost:3000` - Debería mostrar tu servidor backend
- `http://localhost:3000/socket.io/` - Debería mostrar la configuración de Socket.IO

### 4. Logs de depuración

Abre las DevTools del navegador (F12) y verifica la consola:

- ✅ `🔌 Socket conectado exitosamente` - Todo funciona
- ❌ Errores de conexión - El servidor no está disponible

## 🎯 Estados del Sistema

### Estado Normal (Conectado):

- ✅ Notificación superior NO aparece
- ✅ Tarjetas son clickeables con animaciones
- ✅ Rutas protegidas cargan normalmente

### Estado Desconectado:

- ⚠️ Notificación naranja en la parte superior
- ⚠️ Tarjetas muestran overlay al hacer hover
- ⚠️ Rutas protegidas muestran página de error con helper

## 🔄 Flujo de Reconexión

El sistema automáticamente:

1. Intenta reconectar cada 1 segundo
2. Máximo 5 intentos de reconexión
3. Muestra contadores de intentos
4. Se actualiza automáticamente cuando se restablece la conexión

## 📝 Ejemplo de Servidor Socket.IO Mínimo

Si no tienes un servidor backend, aquí hay un ejemplo básico:

```javascript
// server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
```

```bash
# Instalar dependencias
npm install express socket.io cors

# Ejecutar servidor
node server.js
```

## 🎉 Resultado Esperado

Una vez que el servidor esté corriendo:

1. La notificación naranja desaparecerá automáticamente
2. Las tarjetas volverán a ser clickeables
3. Podrás acceder a las rutas protegidas normalmente
4. La aplicación funcionará completamente
