import { io } from 'socket.io-client';

let socket = null;

// Detectar a URL do Socket dinamicamente
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  const host = window.location.hostname;
  const socketPort = 3000;
  return `http://${host}:${socketPort}`;
};

export const initializeSocket = () => {
  if (socket) return socket;

  socket = io(getSocketUrl(), {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket conectado:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket desconectado');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Erro de conexão WebSocket:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Funções helpers para rooms
export const joinRoom = (room) => {
  const socket = getSocket();
  socket.emit(`join:${room}`);
};

export const leaveRoom = (room) => {
  const socket = getSocket();
  socket.emit(`leave:${room}`);
};
