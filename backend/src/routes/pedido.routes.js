import { Router } from 'express';
import { body, query } from 'express-validator';
import pedidoController from '../controllers/pedido.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAnyPermission, PERMISSIONS } from '../middleware/permissions.js';
import { validate } from '../middleware/validator.js';

const router = Router();

// ============================================
// VALIDAÇÕES
// ============================================

const criarPedidoValidation = [
  body('clienteId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('ID do cliente inválido')
    .toInt(),
  body('paraViagem')
    .optional()
    .isBoolean()
    .toBoolean(),
  body('mesaId')
    .custom((value, { req }) => {
      // Se for para viagem, mesaId pode ser nulo/vazio
      if (req.body.paraViagem === true || req.body.paraViagem === 'true') {
        return true;
      }
      // Se NÃO for para viagem, mesaId deve existir e ser um número válido
      if (!value) {
        throw new Error('Mesa é obrigatória para pedidos locais');
      }
      return true;
    })
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('ID da mesa inválido')
    .toInt(),
  body('observacao')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 500 })
    .withMessage('Observação deve ter no máximo 500 caracteres')
    .trim(),
  body('itens')
    .isArray({ min: 1 })
    .withMessage('Pedido deve ter pelo menos um item'),
  body('itens.*.produtoId')
    .isInt({ min: 1 })
    .withMessage('ID do produto inválido')
    .toInt(),
  body('itens.*.quantidade')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantidade deve ser entre 1 e 100')
    .toInt(),
  body('itens.*.observacao')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 200 })
    .withMessage('Observação do item deve ter no máximo 200 caracteres')
    .trim(),
];

const atualizarStatusValidation = [
  body('status')
    .isIn(['aguardando', 'preparando', 'pronto', 'entregue', 'cancelado'])
    .withMessage('Status inválido'),
];

const cancelarPedidoValidation = [
  body('motivo')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Motivo deve ter no máximo 200 caracteres')
    .trim(),
];

const listarPedidosValidation = [
  query('status')
    .optional()
    .custom((value) => {
      // Aceita um status único ou múltiplos separados por vírgula
      const statusValidos = ['aguardando', 'preparando', 'pronto', 'entregue', 'cancelado', 'pago'];
      const statusList = value.split(',').map(s => s.trim());
      const todosValidos = statusList.every(s => statusValidos.includes(s));
      if (!todosValidos) {
        throw new Error('Status inválido');
      }
      return true;
    }),
  query('mesaId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da mesa inválido')
    .toInt(),
  query('clienteId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do cliente inválido')
    .toInt(),
  query('dataInicio')
    .optional()
    .isISO8601()
    .withMessage('Data de início inválida'),
  query('dataFim')
    .optional()
    .isISO8601()
    .withMessage('Data de fim inválida'),
];

// ============================================
// ROTAS PROTEGIDAS
// ============================================

/**
 * @route   GET /api/pedidos
 * @desc    Lista pedidos com filtros
 * @access  Private - ver_pedidos
 */
router.get(
  '/',
  authenticate,
  requireAnyPermission([PERMISSIONS.VER_PEDIDOS, PERMISSIONS.CRIAR_PEDIDO]),
  listarPedidosValidation,
  validate,
  pedidoController.listar
);

/**
 * @route   GET /api/pedidos/:id
 * @desc    Busca pedido por ID
 * @access  Private - ver_pedidos
 */
router.get(
  '/:id',
  authenticate,
  requireAnyPermission([PERMISSIONS.VER_PEDIDOS, PERMISSIONS.CRIAR_PEDIDO]),
  pedidoController.buscarPorId
);

/**
 * @route   POST /api/pedidos
 * @desc    Cria novo pedido
 * @access  Private - criar_pedido
 */
router.post(
  '/',
  authenticate,
  requireAnyPermission([PERMISSIONS.CRIAR_PEDIDO]),
  criarPedidoValidation,
  validate,
  pedidoController.criar
);

/**
 * @route   PATCH /api/pedidos/:id/status
 * @desc    Atualiza status do pedido
 * @access  Private - editar_pedido ou marcar_pronto
 */
router.patch(
  '/:id/status',
  authenticate,
  requireAnyPermission([PERMISSIONS.EDITAR_PEDIDO, PERMISSIONS.MARCAR_PRONTO]),
  atualizarStatusValidation,
  validate,
  pedidoController.atualizarStatus
);

/**
 * @route   POST /api/pedidos/:id/cancelar
 * @desc    Cancela pedido
 * @access  Private - cancelar_pedido
 */
router.post(
  '/:id/cancelar',
  authenticate,
  requireAnyPermission([PERMISSIONS.CANCELAR_PEDIDO]),
  cancelarPedidoValidation,
  validate,
  pedidoController.cancelar
);

/**
 * @route   POST /api/pedidos/:id/finalizar
 * @desc    Finaliza pedido (marca como pago/entregue)
 * @access  Private - finalizar_pedido
 */
router.post(
  '/:id/finalizar',
  authenticate,
  requireAnyPermission([PERMISSIONS.FINALIZAR_PEDIDO]),
  pedidoController.finalizar
);

export default router;
