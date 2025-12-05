import express from 'express';
import { body, query } from 'express-validator';
import { validarErros } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermissions, PERMISSIONS } from '../middleware/permissions.js';
import * as usuarioController from '../controllers/usuario.controller.js';

const router = express.Router();

// ============================================
// ROTAS DE USUÁRIOS
// ============================================

// Listar usuários (requer permissão)
router.get(
  '/usuarios',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS]),
  [
    query('busca').optional().isString().withMessage('Busca deve ser texto'),
    query('grupoId').optional().isInt().withMessage('GrupoId deve ser número'),
    query('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page deve ser >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit deve estar entre 1 e 100'),
    validarErros
  ],
  usuarioController.listarUsuarios
);

// Buscar usuário por ID
router.get(
  '/usuarios/:id',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS]),
  usuarioController.buscarUsuario
);

// Criar usuário
router.post(
  '/usuarios',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS]),
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório').trim(),
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('grupoId').isInt().withMessage('GrupoId é obrigatório e deve ser número'),
    body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano'),
    validarErros
  ],
  usuarioController.criarUsuario
);

// Atualizar usuário
router.put(
  '/usuarios/:id',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS]),
  [
    body('nome').optional().notEmpty().withMessage('Nome não pode ser vazio').trim(),
    body('email').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
    body('senha').optional().isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('grupoId').optional().isInt().withMessage('GrupoId deve ser número'),
    body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano'),
    validarErros
  ],
  usuarioController.atualizarUsuario
);

// Deletar usuário
router.delete(
  '/usuarios/:id',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS]),
  usuarioController.deletarUsuario
);

// Alternar status do usuário (ativar/desativar)
router.patch(
  '/usuarios/:id/status',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS]),
  usuarioController.alternarStatusUsuario
);

// ============================================
// ROTAS DE GRUPOS
// ============================================

// Listar grupos
router.get(
  '/grupos',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS]),
  [
    query('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano'),
    validarErros
  ],
  usuarioController.listarGrupos
);

// Buscar grupo por ID
router.get(
  '/grupos/:id',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS]),
  usuarioController.buscarGrupo
);

// Criar grupo
router.post(
  '/grupos',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS]),
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório').trim(),
    body('descricao').optional().isString().withMessage('Descrição deve ser texto').trim(),
    body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano'),
    validarErros
  ],
  usuarioController.criarGrupo
);

// Atualizar grupo
router.put(
  '/grupos/:id',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS]),
  [
    body('nome').optional().notEmpty().withMessage('Nome não pode ser vazio').trim(),
    body('descricao').optional().isString().withMessage('Descrição deve ser texto').trim(),
    body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano'),
    validarErros
  ],
  usuarioController.atualizarGrupo
);

// Deletar grupo
router.delete(
  '/grupos/:id',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS]),
  usuarioController.deletarGrupo
);

// Vincular permissões ao grupo
router.post(
  '/grupos/:id/permissoes',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS]),
  [
    body('permissoesIds').isArray({ min: 0 }).withMessage('PermissoesIds deve ser um array'),
    body('permissoesIds.*').isInt().withMessage('Cada permissão deve ser um número'),
    validarErros
  ],
  usuarioController.vincularPermissoes
);

// ============================================
// ROTAS DE PERMISSÕES
// ============================================

// Listar permissões
router.get(
  '/permissoes',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS]),
  [
    query('modulo').optional().isString().withMessage('Módulo deve ser texto'),
    validarErros
  ],
  usuarioController.listarPermissoes
);

// Listar módulos disponíveis
router.get(
  '/permissoes/modulos',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS]),
  usuarioController.listarModulos
);

export default router;
