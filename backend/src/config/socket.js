import { Server } from 'socket.io';
import logger from '../utils/logger.js';

/**
 * Configuração e gerenciamento do Socket.IO
 */

let io = null;

/**
 * Inicializa o Socket.IO
 * @param {import('http').Server} httpServer - Servidor HTTP
 * @returns {Server} - Instância do Socket.IO
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware de autenticação (será implementado depois)
  io.use((socket, next) => {
    // TODO: Validar token JWT aqui
    // const token = socket.handshake.auth.token;
    next();
  });

  // Eventos de conexão
  io.on('connection', (socket) => {
    logger.info(`🔌 Cliente conectado: ${socket.id}`);

    // Join em salas específicas
    socket.on('join_room', (room) => {
      socket.join(room);
      logger.info(`📍 Socket ${socket.id} entrou na sala: ${room}`);
      socket.emit('joined_room', room);
    });

    socket.on('leave_room', (room) => {
      socket.leave(room);
      logger.info(`🚪 Socket ${socket.id} saiu da sala: ${room}`);
      socket.emit('left_room', room);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`❌ Cliente desconectado: ${socket.id} - Razão: ${reason}`);
    });

    socket.on('error', (error) => {
      logger.error(`⚠️ Erro no socket ${socket.id}:`, error);
    });
  });

  logger.info('📡 Socket.IO inicializado');
  return io;
}

/**
 * Retorna a instância do Socket.IO
 * @returns {Server|null}
 */
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO não foi inicializado! Chame initSocket() primeiro.');
  }
  return io;
}

/**
 * Emite evento para uma sala específica
 * @param {string} room - Nome da sala
 * @param {string} event - Nome do evento
 * @param {any} data - Dados a enviar
 */
export function emitToRoom(room, event, data) {
  if (!io) {
    logger.warn('Socket.IO não inicializado. Evento não enviado.');
    return;
  }
  io.to(room).emit(event, data);
  logger.debug(`📤 Evento '${event}' enviado para sala '${room}'`);
}

/**
 * Emite evento para todos os clientes
 * @param {string} event - Nome do evento
 * @param {any} data - Dados a enviar
 */
export function emitToAll(event, data) {
  if (!io) {
    logger.warn('Socket.IO não inicializado. Evento não enviado.');
    return;
  }
  io.emit(event, data);
  logger.debug(`📤 Evento '${event}' enviado para todos os clientes`);
}

/**
 * Emite evento para um namespace específico
 * @param {string} namespace - Nome do namespace
 * @param {string} event - Nome do evento
 * @param {any} data - Dados a enviar
 */
export function emitToNamespace(namespace, event, data) {
  if (!io) {
    logger.warn('Socket.IO não inicializado. Evento não enviado.');
    return;
  }
  io.of(namespace).emit(event, data);
  logger.debug(`📤 Evento '${event}' enviado para namespace '${namespace}'`);
}

/**
 * Lista de eventos disponíveis
 */
export const SOCKET_EVENTS = {
  // Pedidos
  NOVO_PEDIDO: 'novo_pedido',
  PEDIDO_ATUALIZADO: 'pedido_atualizado',
  PEDIDO_CANCELADO: 'pedido_cancelado',
  PEDIDO_PRONTO: 'pedido_pronto',
  PEDIDO_ENTREGUE: 'pedido_entregue',
  
  // Mesas
  MESA_OCUPADA: 'mesa_ocupada',
  MESA_LIBERADA: 'mesa_liberada',
  
  // Produtos
  PRODUTO_INDISPONIVEL: 'produto_indisponivel',
  PRODUTO_DISPONIVEL: 'produto_disponivel',
  
  // Estoque
  ESTOQUE_BAIXO: 'estoque_baixo',
  ESTOQUE_ZERADO: 'estoque_zerado',
  
  // Notificações
  NOTIFICACAO: 'notificacao',
};

/**
 * Salas padrão do sistema
 */
export const SOCKET_ROOMS = {
  ATENDENTES: 'atendentes',
  COZINHA: 'cozinha',
  CAIXA: 'caixa',
  ADMIN: 'admin',
  DASHBOARD: 'dashboard',
};
