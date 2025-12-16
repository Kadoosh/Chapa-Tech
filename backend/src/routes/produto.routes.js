import { Router } from 'express';
import { body, query } from 'express-validator';
import produtoController from '../controllers/produto.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermissions, PERMISSIONS } from '../middleware/permissions.js';
import { validate } from '../middleware/validator.js';

const router = Router();

// ============================================
// VALIDAÇÕES
// ============================================

const criarProdutoValidation = [
  body('nome')
    .isString()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ max: 100 })
    .withMessage('Nome deve ter no máximo 100 caracteres')
    .trim(),
  body('descricao')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
    .trim(),
  body('ingredientes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Ingredientes deve ter no máximo 1000 caracteres')
    .trim(),
  body('preco')
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser um número positivo')
    .toFloat(),
  body('categoriaId')
    .isInt({ min: 1 })
    .withMessage('Categoria inválida')
    .toInt(),
  body('imagens')
    .optional({ values: 'falsy' })
    .customSanitizer(value => {
      if (!value || value === '') return null;
      if (typeof value === 'string') {
        // Decodificar HTML entities (&quot; -> ")
        return value.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      }
      return JSON.stringify(value);
    })
    .custom((value) => {
      if (!value) return true;
      if (typeof value === 'string' && value.trim() === '') return true;
      try {
        const imagens = typeof value === 'string' ? JSON.parse(value) : value;
        if (!Array.isArray(imagens)) return false;
        if (imagens.length > 5) return false;
        return imagens.every(url => typeof url === 'string');
      } catch {
        return false;
      }
    })
    .withMessage('Imagens deve ser um array JSON com no máximo 5 URLs'),
  body('ordem')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Ordem deve ser um número inteiro positivo')
    .toInt(),
  body('disponivel')
    .optional()
    .isBoolean()
    .withMessage('Disponível deve ser true ou false')
    .toBoolean(),
  body('destaque')
    .optional()
    .isBoolean()
    .withMessage('Destaque deve ser true ou false')
    .toBoolean(),
];

const atualizarProdutoValidation = [
  body('nome')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Nome deve ter no máximo 100 caracteres')
    .trim(),
  body('descricao')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
    .trim(),
  body('ingredientes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Ingredientes deve ter no máximo 1000 caracteres')
    .trim(),
  body('preco')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser um número positivo')
    .toFloat(),
  body('categoriaId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Categoria inválida')
    .toInt(),
  body('imagens')
    .optional({ values: 'falsy' })
    .customSanitizer(value => {
      if (!value || value === '') return null;
      if (typeof value === 'string') {
        // Decodificar HTML entities (&quot; -> ")
        return value.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      }
      return JSON.stringify(value);
    })
    .custom((value) => {
      if (!value) return true;
      if (typeof value === 'string' && value.trim() === '') return true;
      try {
        const imagens = typeof value === 'string' ? JSON.parse(value) : value;
        if (!Array.isArray(imagens)) return false;
        if (imagens.length > 5) return false;
        return imagens.every(url => typeof url === 'string');
      } catch {
        return false;
      }
    })
    .withMessage('Imagens deve ser um array JSON com no máximo 5 URLs'),
  body('ordem')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Ordem deve ser um número inteiro positivo')
    .toInt(),
  body('disponivel')
    .optional()
    .isBoolean()
    .withMessage('Disponível deve ser true ou false')
    .toBoolean(),
  body('destaque')
    .optional()
    .isBoolean()
    .withMessage('Destaque deve ser true ou false')
    .toBoolean(),
];

const listarProdutosValidation = [
  query('categoriaId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da categoria inválido')
    .toInt(),
  query('disponivel')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Disponível deve ser true ou false'),
  query('destaque')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Destaque deve ser true ou false'),
  query('busca')
    .optional()
    .isString()
    .trim(),
];

// ============================================
// ROTAS PÚBLICAS
// ============================================

/**
 * @route   GET /api/produtos
 * @desc    Lista produtos (com filtros opcionais)
 * @access  Public
 */
router.get('/', listarProdutosValidation, validate, produtoController.listar);

/**
 * @route   GET /api/produtos/destaques
 * @desc    Lista produtos em destaque
 * @access  Public
 */
router.get('/destaques', produtoController.listarDestaques);

/**
 * @route   GET /api/produtos/:id
 * @desc    Busca produto por ID
 * @access  Public
 */
router.get('/:id', produtoController.buscarPorId);

// ============================================
// ROTAS PROTEGIDAS
// ============================================

/**
 * @route   POST /api/produtos
 * @desc    Cria novo produto
 * @access  Private - gerenciar_produtos
 */
router.post(
  '/',
  authenticate,
  requirePermissions(PERMISSIONS.GERENCIAR_PRODUTOS),
  criarProdutoValidation,
  validate,
  produtoController.criar
);

/**
 * @route   PUT /api/produtos/:id
 * @desc    Atualiza produto
 * @access  Private - gerenciar_produtos
 */
router.put(
  '/:id',
  authenticate,
  requirePermissions(PERMISSIONS.GERENCIAR_PRODUTOS),
  atualizarProdutoValidation,
  validate,
  produtoController.atualizar
);

/**
 * @route   DELETE /api/produtos/:id
 * @desc    Deleta produto
 * @access  Private - gerenciar_produtos
 */
router.delete(
  '/:id',
  authenticate,
  requirePermissions(PERMISSIONS.GERENCIAR_PRODUTOS),
  produtoController.deletar
);

/**
 * @route   PATCH /api/produtos/:id/disponibilidade
 * @desc    Alterna disponibilidade do produto
 * @access  Private - gerenciar_produtos
 */
router.patch(
  '/:id/disponibilidade',
  authenticate,
  requirePermissions(PERMISSIONS.GERENCIAR_PRODUTOS),
  produtoController.alternarDisponibilidade
);

export default router;
