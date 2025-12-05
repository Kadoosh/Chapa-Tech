import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/permissions.js';
import { validate } from '../middleware/validator.js';

const router = Router();

// ============================================
// VALIDAÇÕES
// ============================================

const loginValidation = [
  body('login')
    .isString()
    .notEmpty()
    .withMessage('Login é obrigatório'),
  body('senha')
    .isString()
    .notEmpty()
    .withMessage('Senha é obrigatória'),
];

const alterarSenhaValidation = [
  body('senhaAtual')
    .isString()
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('novaSenha')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter no mínimo 6 caracteres'),
];

const registrarValidation = [
  body('nome')
    .isString()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('senha')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('telefone')
    .optional()
    .isString()
    .trim(),
  body('grupoId')
    .isInt({ min: 1 })
    .withMessage('Grupo inválido')
    .toInt(),
];

// ============================================
// ROTAS PÚBLICAS
// ============================================

/**
 * @route   POST /api/auth/login
 * @desc    Login do usuário
 * @access  Public
 */
router.post('/login', loginValidation, validate, authController.login);

// ============================================
// ROTAS PROTEGIDAS
// ============================================

/**
 * @route   GET /api/auth/me
 * @desc    Retorna dados do usuário autenticado
 * @access  Private
 */
router.get('/me', authenticate, authController.me);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renova token JWT
 * @access  Private
 */
router.post('/refresh', authenticate, authController.refresh);

/**
 * @route   POST /api/auth/alterar-senha
 * @desc    Altera senha do usuário
 * @access  Private
 */
router.post(
  '/alterar-senha',
  authenticate,
  alterarSenhaValidation,
  validate,
  authController.alterarSenha
);

/**
 * @route   POST /api/auth/registrar
 * @desc    Registra novo usuário (apenas admin)
 * @access  Private - Admin only
 */
router.post(
  '/registrar',
  authenticate,
  requireAdmin(),
  registrarValidation,
  validate,
  authController.registrar
);

export default router;
