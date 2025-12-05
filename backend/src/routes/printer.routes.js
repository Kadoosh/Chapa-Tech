import express from 'express';
import { body } from 'express-validator';
import { validarErros } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermissions, PERMISSIONS } from '../middleware/permissions.js';
import * as printerController from '../controllers/printer.controller.js';

const router = express.Router();

// Middleware: requer autenticação e permissão de admin
const requireAdmin = [
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_USUARIOS])
];

// Obter configuração
router.get(
  '/config',
  ...requireAdmin,
  printerController.obterConfig
);

// Atualizar configuração
router.put(
  '/config',
  ...requireAdmin,
  [
    body('habilitada').optional().isBoolean(),
    body('tipo').optional().isString(),
    body('interface').optional().isString(),
    body('endereco').optional().isString(),
    body('porta').optional().isInt(),
    body('larguraPapel').optional().isInt({ min: 32, max: 80 }),
    body('autoImprimirPedido').optional().isBoolean(),
    body('autoImprimirComprovante').optional().isBoolean(),
    validarErros
  ],
  printerController.atualizarConfig
);

// Testar conexão
router.post(
  '/testar',
  ...requireAdmin,
  printerController.testarConexao
);

// Imprimir pedido
router.post(
  '/imprimir/pedido/:pedidoId',
  authenticate,
  requirePermissions([PERMISSIONS.VER_PEDIDOS]),
  printerController.imprimirPedido
);

// Imprimir comprovante
router.post(
  '/imprimir/comprovante/:pedidoId',
  authenticate,
  requirePermissions([PERMISSIONS.FINALIZAR_PEDIDO]),
  printerController.imprimirComprovante
);

// Preview pedido
router.get(
  '/preview/pedido/:pedidoId',
  authenticate,
  requirePermissions([PERMISSIONS.VER_PEDIDOS]),
  printerController.previewPedido
);

// Preview comprovante
router.get(
  '/preview/comprovante/:pedidoId',
  authenticate,
  requirePermissions([PERMISSIONS.FINALIZAR_PEDIDO]),
  printerController.previewComprovante
);

export default router;
