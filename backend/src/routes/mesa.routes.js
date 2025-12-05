import { Router } from 'express';
import { body, query } from 'express-validator';
import mesaController from '../controllers/mesa.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAnyPermission, PERMISSIONS } from '../middleware/permissions.js';
import { validate } from '../middleware/validator.js';

const router = Router();

// ============================================
// VALIDAÇÕES
// ============================================

const criarMesaValidation = [
  body('numero')
    .isInt({ min: 1 })
    .withMessage('Número da mesa deve ser um inteiro positivo')
    .toInt(),
  body('capacidade')
    .isInt({ min: 1, max: 50 })
    .withMessage('Capacidade deve ser entre 1 e 50')
    .toInt(),
  body('localizacao')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Localização deve ter no máximo 100 caracteres')
    .trim(),
];

const atualizarMesaValidation = [
  body('numero')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Número da mesa deve ser um inteiro positivo')
    .toInt(),
  body('capacidade')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Capacidade deve ser entre 1 e 50')
    .toInt(),
  body('localizacao')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Localização deve ter no máximo 100 caracteres')
    .trim(),
];

const ocuparMesaValidation = [
  body('pedidoId')
    .isInt({ min: 1 })
    .withMessage('ID do pedido inválido')
    .toInt(),
];

// ============================================
// ROTAS PROTEGIDAS
// ============================================

/**
 * @route   GET /api/mesas
 * @desc    Lista todas as mesas
 * @access  Private - criar_pedido
 */
router.get(
  '/',
  authenticate,
  requireAnyPermission([PERMISSIONS.CRIAR_PEDIDO, PERMISSIONS.VER_PEDIDOS, PERMISSIONS.GERENCIAR_MESAS]),
  query('status')
    .optional()
    .isIn(['livre', 'ocupada', 'reservada'])
    .withMessage('Status deve ser livre, ocupada ou reservada'),
  validate,
  mesaController.listar
);

/**
 * @route   GET /api/mesas/numero/:numero
 * @desc    Busca mesa por número
 * @access  Private - criar_pedido
 */
router.get(
  '/numero/:numero',
  authenticate,
  requireAnyPermission([PERMISSIONS.CRIAR_PEDIDO, PERMISSIONS.VER_PEDIDOS, PERMISSIONS.GERENCIAR_MESAS]),
  mesaController.buscarPorNumero
);

/**
 * @route   GET /api/mesas/:id
 * @desc    Busca mesa por ID
 * @access  Private - criar_pedido
 */
router.get(
  '/:id',
  authenticate,
  requireAnyPermission([PERMISSIONS.CRIAR_PEDIDO, PERMISSIONS.VER_PEDIDOS, PERMISSIONS.GERENCIAR_MESAS]),
  mesaController.buscarPorId
);

/**
 * @route   POST /api/mesas
 * @desc    Cria nova mesa
 * @access  Private - gerenciar_mesas
 */
router.post(
  '/',
  authenticate,
  requireAnyPermission([PERMISSIONS.GERENCIAR_MESAS]),
  criarMesaValidation,
  validate,
  mesaController.criar
);

/**
 * @route   PUT /api/mesas/:id
 * @desc    Atualiza mesa
 * @access  Private - gerenciar_mesas
 */
router.put(
  '/:id',
  authenticate,
  requireAnyPermission([PERMISSIONS.GERENCIAR_MESAS]),
  atualizarMesaValidation,
  validate,
  mesaController.atualizar
);

/**
 * @route   DELETE /api/mesas/:id
 * @desc    Deleta mesa
 * @access  Private - gerenciar_mesas
 */
router.delete(
  '/:id',
  authenticate,
  requireAnyPermission([PERMISSIONS.GERENCIAR_MESAS]),
  mesaController.deletar
);

/**
 * @route   PATCH /api/mesas/:id/ocupar
 * @desc    Ocupa mesa (vincula com pedido)
 * @access  Private - criar_pedido
 */
router.patch(
  '/:id/ocupar',
  authenticate,
  requireAnyPermission([PERMISSIONS.CRIAR_PEDIDO]),
  ocuparMesaValidation,
  validate,
  mesaController.ocupar
);

/**
 * @route   PATCH /api/mesas/:id/liberar
 * @desc    Libera mesa
 * @access  Private - finalizar_pedido
 */
router.patch(
  '/:id/liberar',
  authenticate,
  requireAnyPermission([PERMISSIONS.FINALIZAR_PEDIDO]),
  mesaController.liberar
);

/**
 * @route   PATCH /api/mesas/:id/reservar
 * @desc    Reserva mesa
 * @access  Private - gerenciar_mesas
 */
router.patch(
  '/:id/reservar',
  authenticate,
  requireAnyPermission([PERMISSIONS.GERENCIAR_MESAS, PERMISSIONS.CRIAR_PEDIDO]),
  mesaController.reservar
);

export default router;
