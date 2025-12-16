import logger from '../utils/logger.js';

/**
 * Configuração CORS - Zero Trust
 * Apenas origens explicitamente autorizadas são permitidas
 */

// Origens permitidas (definir no .env para produção)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

// Em produção, NÃO permitir requests sem origin
const allowEmptyOrigin = process.env.NODE_ENV !== 'production';

const corsOptions = {
  origin: (origin, callback) => {
    // Em desenvolvimento, permitir requests sem origin (Postman, curl)
    if (!origin && allowEmptyOrigin) {
      return callback(null, true);
    }

    // Em produção, BLOQUEAR requests sem origin
    if (!origin && !allowEmptyOrigin) {
      logger.warn('Request sem origin bloqueado em produção');
      return callback(new Error('Origin não fornecida'));
    }

    // Verificar lista de origens permitidas
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Permitir IPs de rede local (apenas em desenvolvimento)
    if (process.env.NODE_ENV !== 'production') {
      const localNetworkPattern = /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|localhost)(:\d+)?$/;
      if (localNetworkPattern.test(origin)) {
        return callback(null, true);
      }
    }

    // Logar e bloquear origem não autorizada
    logger.warn('Origem bloqueada pelo CORS', {
      origin,
      allowedOrigins,
    });

    callback(new Error('Bloqueado pelo CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Disposition'], // Para downloads
  maxAge: 86400, // 24 horas de cache para preflight
  optionsSuccessStatus: 200, // Para compatibilidade com browsers antigos
};

export default corsOptions;

