import logger from '../utils/logger.js';

/**
 * Middleware global de tratamento de erros
 */
export const errorHandler = (err, req, res, next) => {
  // Log do erro
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Status code padrão
  const statusCode = err.statusCode || err.status || 500;

  // Preparar resposta de erro
  const errorResponse = {
    error: true,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details,
    }),
  };

  // Erros específicos do Prisma
  if (err.code?.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // Erros de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: true,
      message: 'Erro de validação',
      details: err.details || err.message,
    });
  }

  // Erros de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: true,
      message: 'Token inválido',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: true,
      message: 'Token expirado',
    });
  }

  // Resposta padrão
  res.status(statusCode).json(errorResponse);
};

/**
 * Tratamento específico para erros do Prisma
 */
function handlePrismaError(err, res) {
  const prismaErrors = {
    P2002: {
      status: 409,
      message: 'Registro duplicado',
      getDetail: (err) => {
        const target = err.meta?.target;
        return target ? `Já existe um registro com este ${target.join(', ')}` : 'Valor já existe';
      },
    },
    P2025: {
      status: 404,
      message: 'Registro não encontrado',
    },
    P2003: {
      status: 400,
      message: 'Violação de constraint de chave estrangeira',
    },
    P2014: {
      status: 400,
      message: 'Violação de relação',
    },
  };

  const errorConfig = prismaErrors[err.code];

  if (errorConfig) {
    return res.status(errorConfig.status).json({
      error: true,
      message: errorConfig.message,
      details: errorConfig.getDetail ? errorConfig.getDetail(err) : err.meta,
    });
  }

  // Erro Prisma genérico
  return res.status(500).json({
    error: true,
    message: 'Erro no banco de dados',
    ...(process.env.NODE_ENV === 'development' && {
      code: err.code,
      details: err.meta,
    }),
  });
}

/**
 * Classe de erro customizada para facilitar o uso
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wrapper async para rotas - captura erros automaticamente
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
