import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/permissions.js';
import { validate } from '../middleware/validator.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

// ============================================
// VALIDAÇÕES
// ============================================

const loginValidation = [
  body('login')
    .isString()
    .notEmpty()
    .withMessage('Login é obrigatório')
    .isLength({ max: 100 })
    .withMessage('Login muito longo')
    .trim(),
  body('senha')
    .isString()
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ max: 100 })
    .withMessage('Senha muito longa'),
];

const alterarSenhaValidation = [
  body('senhaAtual')
    .isString()
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('novaSenha')
    .isString()
    .isLength({ min: 6, max: 100 })
    .withMessage('Nova senha deve ter entre 6 e 100 caracteres'),
];

const registrarValidation = [
  body('nome')
    .isString()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ max: 100 })
    .withMessage('Nome muito longo')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .isLength({ max: 150 })
    .withMessage('Email muito longo')
    .normalizeEmail(),
  body('senha')
    .isString()
    .isLength({ min: 6, max: 100 })
    .withMessage('Senha deve ter entre 6 e 100 caracteres'),
  body('telefone')
    .optional()
    .isString()
    .isLength({ max: 20 })
    .withMessage('Telefone muito longo')
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
 * @security Rate limited: 5 tentativas por minuto
 */
router.post('/login', authLimiter, loginValidation, validate, authController.login);

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
