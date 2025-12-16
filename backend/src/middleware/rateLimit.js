import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { AppError } from './errorHandler.js';

/**
 * Rate Limiter Global
 * Limita todas as requisições para prevenir DDoS
 */
export const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100, // 100 requests por minuto
    message: {
        success: false,
        error: 'Muitas requisições. Tente novamente em 1 minuto.',
        code: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        res.status(429).json(options.message);
    },
});

/**
 * Rate Limiter para Autenticação
 * Mais restritivo para prevenir força bruta
 */
export const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 5, // 5 tentativas por minuto
    message: {
        success: false,
        error: 'Muitas tentativas de login. Aguarde 1 minuto.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
    handler: (req, res, next, options) => {
        res.status(429).json(options.message);
    },
});

/**
 * Rate Limiter para API (por usuário autenticado)
 * Baseado no IP ou user ID
 */
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 60, // 60 requests por minuto por usuário
    message: {
        success: false,
        error: 'Limite de requisições excedido. Aguarde 1 minuto.',
        code: 'API_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Usa ID do usuário se autenticado, senão usa IP com suporte IPv6
        return req.user?.id?.toString() || ipKeyGenerator(req);
    },
    handler: (req, res, next, options) => {
        res.status(429).json(options.message);
    },
});

/**
 * Rate Limiter para operações sensíveis (criar pedidos, etc)
 */
export const sensitiveLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30, // 30 operações por minuto
    message: {
        success: false,
        error: 'Muitas operações. Aguarde um momento.',
        code: 'SENSITIVE_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Usa ID do usuário se autenticado, senão usa IP com suporte IPv6
        return req.user?.id?.toString() || ipKeyGenerator(req);
    },
    handler: (req, res, next, options) => {
        res.status(429).json(options.message);
    },
});
