import { Router } from 'express';
import { body, query } from 'express-validator';
import categoriaController from '../controllers/categoria.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermissions, PERMISSIONS } from '../middleware/permissions.js';
import { validate } from '../middleware/validator.js';

const router = Router();

// ============================================
// VALIDAÇÕES
// ============================================

const criarCategoriaValidation = [
  body('nome')
    .isString()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ max: 50 })
    .withMessage('Nome deve ter no máximo 50 caracteres')
    .trim(),
  body('descricao')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Descrição deve ter no máximo 200 caracteres')
    .trim(),
  body('icone')
    .optional()
    .isString()
    .trim(),
  body('cor')
    .optional()
    .matches(/^#([0-9A-F]{3}){1,2}$/i)
    .withMessage('Cor deve estar no formato hexadecimal (#000000)'),
  body('ordem')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Ordem deve ser um número inteiro positivo')
    .toInt(),
];

const atualizarCategoriaValidation = [
  body('nome')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('Nome deve ter no máximo 50 caracteres')
    .trim(),
  body('descricao')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Descrição deve ter no máximo 200 caracteres')
    .trim(),
  body('icone')
    .optional()
    .isString()
    .trim(),
  body('cor')
    .optional()
    .matches(/^#([0-9A-F]{3}){1,2}$/i)
    .withMessage('Cor deve estar no formato hexadecimal (#000000)'),
  body('ordem')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Ordem deve ser um número inteiro positivo')
    .toInt(),
  body('ativa')
    .optional()
    .isBoolean()
    .withMessage('Ativa deve ser true ou false')
    .toBoolean(),
];

const reordenarValidation = [
  body('ordens')
    .isArray({ min: 1 })
    .withMessage('Ordens deve ser um array não vazio'),
  body('ordens.*.id')
    .isInt({ min: 1 })
    .withMessage('ID inválido')
    .toInt(),
  body('ordens.*.ordem')
    .isInt({ min: 0 })
    .withMessage('Ordem inválida')
    .toInt(),
];

// ============================================
// ROTAS PÚBLICAS
// ============================================

/**
 * @route   GET /api/categorias
 * @desc    Lista todas as categorias
 * @access  Public
 */
router.get(
  '/',
  query('apenasAtivas')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('apenasAtivas deve ser true ou false'),
  validate,
  categoriaController.listar
);

/**
 * @route   GET /api/categorias/:id
 * @desc    Busca categoria por ID com produtos
 * @access  Public
 */
router.get('/:id', categoriaController.buscarPorId);

// ============================================
// ROTAS PROTEGIDAS
// ============================================

/**
 * @route   POST /api/categorias
 * @desc    Cria nova categoria
 * @access  Private - gerenciar_produtos
 */
router.post(
  '/',
  authenticate,
  requirePermissions(PERMISSIONS.GERENCIAR_PRODUTOS),
  criarCategoriaValidation,
  validate,
  categoriaController.criar
);

/**
 * @route   PUT /api/categorias/:id
 * @desc    Atualiza categoria
 * @access  Private - gerenciar_produtos
 */
router.put(
  '/:id',
  authenticate,
  requirePermissions(PERMISSIONS.GERENCIAR_PRODUTOS),
  atualizarCategoriaValidation,
  validate,
  categoriaController.atualizar
);

/**
 * @route   DELETE /api/categorias/:id
 * @desc    Deleta categoria
 * @access  Private - gerenciar_produtos
 */
router.delete(
  '/:id',
  authenticate,
  requirePermissions(PERMISSIONS.GERENCIAR_PRODUTOS),
  categoriaController.deletar
);

/**
 * @route   PATCH /api/categorias/:id/status
 * @desc    Alterna status ativo/inativo
 * @access  Private - gerenciar_produtos
 */
router.patch(
  '/:id/status',
  authenticate,
  requirePermissions(PERMISSIONS.GERENCIAR_PRODUTOS),
  categoriaController.alternarStatus
);

/**
 * @route   POST /api/categorias/reordenar
 * @desc    Reordena categorias
 * @access  Private - gerenciar_produtos
 */
router.post(
  '/reordenar',
  authenticate,
  requirePermissions(PERMISSIONS.GERENCIAR_PRODUTOS),
  reordenarValidation,
  validate,
  categoriaController.reordenar
);

export default router;
