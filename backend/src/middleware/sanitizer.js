import logger from '../utils/logger.js';

/**
 * Middleware de Sanitização de Dados
 * Remove caracteres perigosos e previne XSS/Injection
 */

/**
 * Sanitiza uma string removendo tags HTML e caracteres perigosos
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;

    return str
        // Remove tags HTML
        .replace(/<[^>]*>/g, '')
        // Remove scripts
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Escapa caracteres especiais HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        // Remove null bytes
        .replace(/\0/g, '')
        // Limita espaços em branco excessivos
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Sanitiza um objeto recursivamente
 */
const sanitizeObject = (obj, depth = 0) => {
    // Previne recursão infinita
    if (depth > 10) return obj;

    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item, depth + 1));
    }

    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            // Sanitiza também as chaves do objeto
            const sanitizedKey = sanitizeString(key);
            sanitized[sanitizedKey] = sanitizeObject(value, depth + 1);
        }
        return sanitized;
    }

    return obj;
};

/**
 * Middleware principal de sanitização
 * Aplica sanitização no body (query e params são read-only no Express)
 */
export const sanitize = (req, res, next) => {
    try {
        // Sanitiza body (este pode ser modificado)
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }

        // Para query e params, apenas validamos mas não reatribuímos
        // pois são read-only no Express moderno
        // A validação é feita pelo blockSuspiciousPayloads

        next();
    } catch (error) {
        logger.error('Erro na sanitização:', error);
        next(error);
    }
};

/**
 * Middleware para bloquear payloads suspeitos
 * Detecta tentativas de SQL injection e NoSQL injection
 */
export const blockSuspiciousPayloads = (req, res, next) => {
    const suspiciousPatterns = [
        // SQL Injection patterns
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
        /(--|#|\/\*|\*\/)/,
        /(\bOR\b\s+\d+\s*=\s*\d+)/i,
        /(\bAND\b\s+\d+\s*=\s*\d+)/i,
        // NoSQL Injection patterns
        /\$where/i,
        /\$regex/i,
        /\$gt|\$lt|\$ne|\$eq/i,
        // Path traversal
        /\.\.\//,
        // Null byte injection
        /%00/,
    ];

    const checkValue = (value) => {
        if (typeof value !== 'string') return false;
        return suspiciousPatterns.some(pattern => pattern.test(value));
    };

    const checkObject = (obj) => {
        if (!obj || typeof obj !== 'object') return false;

        for (const [key, value] of Object.entries(obj)) {
            if (checkValue(key) || checkValue(value)) {
                return true;
            }
            if (typeof value === 'object' && checkObject(value)) {
                return true;
            }
        }
        return false;
    };

    // Verifica body, query e params
    if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
        logger.warn('Payload suspeito detectado', {
            ip: req.ip,
            url: req.url,
            method: req.method,
            userAgent: req.get('user-agent'),
        });

        return res.status(400).json({
            success: false,
            error: 'Requisição contém dados inválidos',
            code: 'SUSPICIOUS_PAYLOAD',
        });
    }

    next();
};

/**
 * Valida Content-Type para requisições POST/PUT/PATCH
 */
export const validateContentType = (req, res, next) => {
    const methodsWithBody = ['POST', 'PUT', 'PATCH'];

    if (methodsWithBody.includes(req.method)) {
        const contentType = req.get('Content-Type');

        // Permite apenas JSON e form-data
        const allowedTypes = [
            'application/json',
            'application/x-www-form-urlencoded',
            'multipart/form-data',
        ];

        const isAllowed = allowedTypes.some(type =>
            contentType && contentType.toLowerCase().includes(type.toLowerCase())
        );

        if (!isAllowed && req.body && Object.keys(req.body).length > 0) {
            return res.status(415).json({
                success: false,
                error: 'Content-Type não suportado',
                code: 'UNSUPPORTED_MEDIA_TYPE',
            });
        }
    }

    next();
};

export default {
    sanitize,
    blockSuspiciousPayloads,
    validateContentType,
};
