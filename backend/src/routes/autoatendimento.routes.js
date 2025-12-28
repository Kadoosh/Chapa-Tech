import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';
import { apiLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import autoatendimentoController from '../controllers/autoatendimento.controller.js';

const router = Router();

// ============================================
// VALIDAÇÕES
// ============================================

const criarPedidoValidation = [
    body('tipoAtendimento')
        .isIn(['local', 'viagem'])
        .withMessage('Tipo de atendimento inválido'),
    body('marcador')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 10 })
        .withMessage('Marcador inválido'),
    body('itens')
        .isArray({ min: 1 })
        .withMessage('Pedido deve ter pelo menos um item'),
    body('itens.*.produtoId')
        .isInt({ min: 1 })
        .withMessage('ID do produto inválido')
        .toInt(),
    body('itens.*.quantidade')
        .isInt({ min: 1, max: 50 })
        .withMessage('Quantidade deve ser entre 1 e 50')
        .toInt(),
    body('itens.*.observacao')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 200 })
        .withMessage('Observação muito longa')
        .trim(),
];

// ============================================
// ROTAS PÚBLICAS (não requer autenticação)
// ============================================

/**
 * @route   GET /api/autoatendimento/categorias
 * @desc    Lista categorias disponíveis para auto atendimento
 * @access  Public
 */
router.get(
    '/categorias',
    asyncHandler(autoatendimentoController.listarCategorias)
);

/**
 * @route   GET /api/autoatendimento/produtos
 * @desc    Lista produtos disponíveis para auto atendimento
 * @access  Public
 */
router.get(
    '/produtos',
    asyncHandler(autoatendimentoController.listarProdutos)
);

/**
 * @route   POST /api/autoatendimento/pedido
 * @desc    Cria pedido do auto atendimento
 * @access  Public (com rate limiting)
 */
router.post(
    '/pedido',
    apiLimiter,
    criarPedidoValidation,
    validate,
    asyncHandler(autoatendimentoController.criarPedido)
);

export default router;
