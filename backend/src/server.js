import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { createServer } from 'http';
import logger from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocket } from './config/socket.js';
import prisma from './config/database.js';
import corsOptions from './config/cors.js';

// Middlewares de segurança
import { globalLimiter } from './middleware/rateLimit.js';
import { sanitize, blockSuspiciousPayloads, validateContentType } from './middleware/sanitizer.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const httpServer = createServer(app);

// ============================================
// CONFIGURAÇÃO SOCKET.IO
// ============================================
const io = initSocket(httpServer);

// Disponibilizar io e prisma em toda aplicação
app.set('io', io);
app.set('prisma', prisma);

// ============================================
// MIDDLEWARES DE SEGURANÇA (Zero Trust)
// ============================================

// Trust proxy para funcionar atrás de reverse proxy (nginx, etc)
app.set('trust proxy', 1);

// Helmet: Headers de segurança HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Necessário para Socket.IO
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Rate Limiting Global - previne DDoS
app.use(globalLimiter);

// Validar Content-Type
app.use(validateContentType);

// ============================================
// MIDDLEWARES GLOBAIS
// ============================================
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitização de inputs - NUNCA confiar no frontend
app.use(sanitize);

// Bloquear payloads suspeitos (SQL injection, etc)
app.use(blockSuspiciousPayloads);

// Bloquear acesso a arquivos sensíveis
app.use((req, res, next) => {
  const blockedPaths = [
    '.env',
    '.git',
    'node_modules',
    'prisma',
    'package.json',
    'package-lock.json',
  ];

  const isBlocked = blockedPaths.some(path =>
    req.url.toLowerCase().includes(path.toLowerCase())
  );

  if (isBlocked) {
    logger.warn('Tentativa de acesso a arquivo bloqueado', {
      ip: req.ip,
      url: req.url,
      userAgent: req.get('user-agent'),
    });
    return res.status(403).json({
      success: false,
      error: 'Acesso negado',
      code: 'FORBIDDEN_PATH',
    });
  }

  next();
});

// Log de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ============================================
// ROTAS
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    name: 'Sistema de Lanchonetes API',
    version: '1.0.0',
    description: 'API para gerenciamento de lanchonetes',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      clientes: '/api/clientes',
      produtos: '/api/produtos',
      categorias: '/api/categorias',
      pedidos: '/api/pedidos',
      mesas: '/api/mesas',
      estoque: '/api/estoque',
      configuracoes: '/api/configuracoes',
      dashboard: '/api/dashboard',
    },
  });
});

// Importar rotas
import authRoutes from './routes/auth.routes.js';
import produtoRoutes from './routes/produto.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import mesaRoutes from './routes/mesa.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import estoqueRoutes from './routes/estoque.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import printerRoutes from './routes/printer.routes.js';
import backupRoutes from './routes/backup.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import autoatendimentoRoutes from './routes/autoatendimento.routes.js';
import acompanhamentoRoutes from './routes/acompanhamento.routes.js';

// Registrar rotas
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/mesas', mesaRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/printer', printerRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/autoatendimento', autoatendimentoRoutes);
app.use('/api/acompanhamentos', acompanhamentoRoutes);


// Rota 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.url,
    method: req.method,
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use(errorHandler);

// Socket.IO events são gerenciados em config/socket.js

// ============================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Aceita conexões de qualquer IP

httpServer.listen(PORT, HOST, () => {
  logger.info(`🚀 Servidor rodando em ${HOST}:${PORT}`);
  logger.info(`📡 Socket.IO configurado`);
  logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📝 Health check: http://localhost:${PORT}/health`);
  logger.info(`📚 API Info: http://localhost:${PORT}/api`);
  logger.info(`📱 Rede local: http://<seu-ip>:${PORT}`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido. Encerrando servidor...');
  httpServer.close(() => {
    logger.info('Servidor encerrado');
    process.exit(0);
  });
});
