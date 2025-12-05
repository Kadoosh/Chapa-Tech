import authService from '../services/auth.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Controller de autenticação
 */
class AuthController {
  /**
   * POST /api/auth/login
   * Login do usuário
   */
  login = asyncHandler(async (req, res) => {
    const { login, senha } = req.body;

    const resultado = await authService.login(login, senha);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: resultado,
    });
  });

  /**
   * GET /api/auth/me
   * Retorna dados do usuário autenticado
   */
  me = asyncHandler(async (req, res) => {
    const usuario = await authService.me(req.user.id);

    res.json({
      success: true,
      data: usuario,
    });
  });

  /**
   * POST /api/auth/alterar-senha
   * Altera senha do usuário autenticado
   */
  alterarSenha = asyncHandler(async (req, res) => {
    const { senhaAtual, novaSenha } = req.body;

    const resultado = await authService.alterarSenha(
      req.user.id,
      senhaAtual,
      novaSenha
    );

    res.json({
      success: true,
      message: resultado.message,
    });
  });

  /**
   * POST /api/auth/registrar
   * Registra novo usuário (apenas admin)
   */
  registrar = asyncHandler(async (req, res) => {
    const usuario = await authService.registrar(req.body);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: usuario,
    });
  });

  /**
   * POST /api/auth/refresh
   * Renova token JWT
   */
  refresh = asyncHandler(async (req, res) => {
    // req.user já vem preenchido pelo middleware authenticate
    const { generateToken } = await import('../middleware/auth.js');
    
    const novoToken = generateToken({
      id: req.user.id,
      email: req.user.email,
      grupoId: req.user.grupo.id,
    });

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        token: novoToken,
      },
    });
  });
}

export default new AuthController();
