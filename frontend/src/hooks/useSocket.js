import { useEffect, useRef } from 'react';
import { getSocket } from '../services/socket';

export function useSocket(eventHandlers = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();

    // Registrar event handlers
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socketRef.current.on(event, handler);
    });

    // Cleanup ao desmontar
    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        socketRef.current?.off(event, handler);
      });
    };
  }, []);

  return socketRef.current;
}
