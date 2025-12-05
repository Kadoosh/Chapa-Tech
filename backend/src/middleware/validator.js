import { validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

/**
 * Middleware de validação
 * Verifica se há erros de validação e retorna formatado
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    throw new AppError('Erro de validação', 400, formattedErrors);
  }

  next();
};

// Alias para compatibilidade
export const validarErros = validate;
