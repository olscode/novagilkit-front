// server-test.js - Script simple para probar conexión
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  timeout: 5000,
});

socket.on('connect', () => {
  console.log('✅ Conexión exitosa al servidor Socket.IO');
  console.log('🆔 Socket ID:', socket.id);
  socket.disconnect();
  process.exit(0);
});

socket.on('connect_error', (error) => {
  console.log('❌ Error de conexión:', error.message);
  console.log('🔍 Posibles causas:');
  console.log('   - El servidor no está corriendo en el puerto 3000');
  console.log('   - Firewall bloqueando la conexión');
  console.log('   - CORS no configurado correctamente');
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Desconectado:', reason);
});

setTimeout(() => {
  console.log('⏰ Timeout - No se pudo conectar en 5 segundos');
  process.exit(1);
}, 5000);
