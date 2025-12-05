import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import prisma from '../config/database.js';

/**
 * Middleware de autenticação JWT
 * Verifica se o usuário está autenticado e adiciona os dados ao req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AppError('Token não fornecido', 401);
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AppError('Formato de token inválido', 401);
    }

    const token = parts[1];

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        grupoId: true,
        ativo: true,
        grupo: {
          select: {
            id: true,
            nome: true,
            permissoes: {
              select: {
                permissao: {
                  select: {
                    id: true,
                    chave: true,
                    nome: true,
                    modulo: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 401);
    }

    if (!usuario.ativo) {
      throw new AppError('Usuário inativo', 401);
    }

    // Formatar permissões do usuário
    const permissoes = usuario.grupo.permissoes.map(p => p.permissao.chave);

    // Adicionar dados do usuário na requisição
    req.user = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      grupo: {
        id: usuario.grupo.id,
        nome: usuario.grupo.nome,
      },
      permissoes,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expirado', 401));
    }
    next(error);
  }
};

/**
 * Middleware opcional de autenticação
 * Não falha se não houver token, mas adiciona req.user se houver
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nome: true,
        email: true,
        grupo: {
          select: {
            nome: true,
            permissoes: {
              select: {
                permissao: {
                  select: {
                    chave: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (usuario) {
      req.user = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        grupo: usuario.grupo.nome,
        permissoes: usuario.grupo.permissoes.map(p => p.permissao.chave),
      };
    }

    next();
  } catch (error) {
    // Em caso de erro, apenas continua sem autenticar
    next();
  }
};

/**
 * Gera token JWT
 * @param {Object} payload - Dados a serem incluídos no token
 * @param {string} expiresIn - Tempo de expiração (ex: '7d', '1h')
 */
export const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verifica token JWT
 * @param {string} token - Token a ser verificado
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError('Token inválido ou expirado', 401);
  }
};
