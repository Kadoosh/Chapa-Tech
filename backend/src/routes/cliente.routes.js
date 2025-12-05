import { Router } from 'express';
import { body, query } from 'express-validator';
import clienteController from '../controllers/cliente.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAnyPermission, PERMISSIONS } from '../middleware/permissions.js';
import { validate } from '../middleware/validator.js';

const router = Router();

// ============================================
// VALIDAÇÕES
// ============================================

const criarClienteValidation = [
  body('nome')
    .isString()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ max: 100 })
    .withMessage('Nome deve ter no máximo 100 caracteres')
    .trim(),
  body('telefone')
    .isString()
    .notEmpty()
    .withMessage('Telefone é obrigatório')
    .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('cpf')
    .optional()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve estar no formato XXX.XXX.XXX-XX'),
  body('endereco')
    .optional()
    .isString()
    .isLength({ max: 300 })
    .withMessage('Endereço deve ter no máximo 300 caracteres')
    .trim(),
  body('observacoes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Observações devem ter no máximo 500 caracteres')
    .trim(),
];

const atualizarClienteValidation = [
  body('nome')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Nome deve ter no máximo 100 caracteres')
    .trim(),
  body('telefone')
    .optional()
    .isString()
    .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('cpf')
    .optional()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve estar no formato XXX.XXX.XXX-XX'),
  body('endereco')
    .optional()
    .isString()
    .isLength({ max: 300 })
    .withMessage('Endereço deve ter no máximo 300 caracteres')
    .trim(),
  body('observacoes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Observações devem ter no máximo 500 caracteres')
    .trim(),
];

// ============================================
// ROTAS PROTEGIDAS
// ============================================

/**
 * @route   GET /api/clientes
 * @desc    Lista todos os clientes
 * @access  Private - ver_clientes ou gerenciar_clientes
 */
router.get(
  '/',
  authenticate,
  requireAnyPermission([PERMISSIONS.VER_CLIENTES, PERMISSIONS.GERENCIAR_CLIENTES]),
  query('busca').optional().isString().trim(),
  validate,
  clienteController.listar
);

/**
 * @route   GET /api/clientes/telefone/:telefone
 * @desc    Busca cliente por telefone
 * @access  Private - ver_clientes ou gerenciar_clientes
 */
router.get(
  '/telefone/:telefone',
  authenticate,
  requireAnyPermission([PERMISSIONS.VER_CLIENTES, PERMISSIONS.GERENCIAR_CLIENTES]),
  clienteController.buscarPorTelefone
);

/**
 * @route   GET /api/clientes/:id
 * @desc    Busca cliente por ID
 * @access  Private - ver_clientes ou gerenciar_clientes
 */
router.get(
  '/:id',
  authenticate,
  requireAnyPermission([PERMISSIONS.VER_CLIENTES, PERMISSIONS.GERENCIAR_CLIENTES]),
  clienteController.buscarPorId
);

/**
 * @route   POST /api/clientes
 * @desc    Cria novo cliente
 * @access  Private - gerenciar_clientes
 */
router.post(
  '/',
  authenticate,
  requireAnyPermission([PERMISSIONS.GERENCIAR_CLIENTES, PERMISSIONS.CRIAR_PEDIDO]),
  criarClienteValidation,
  validate,
  clienteController.criar
);

/**
 * @route   PUT /api/clientes/:id
 * @desc    Atualiza cliente
 * @access  Private - gerenciar_clientes
 */
router.put(
  '/:id',
  authenticate,
  requireAnyPermission([PERMISSIONS.GERENCIAR_CLIENTES]),
  atualizarClienteValidation,
  validate,
  clienteController.atualizar
);

/**
 * @route   DELETE /api/clientes/:id
 * @desc    Deleta cliente
 * @access  Private - gerenciar_clientes
 */
router.delete(
  '/:id',
  authenticate,
  requireAnyPermission([PERMISSIONS.GERENCIAR_CLIENTES]),
  clienteController.deletar
);

export default router;
