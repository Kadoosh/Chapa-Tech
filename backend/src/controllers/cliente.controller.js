import clienteService from '../services/cliente.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Controller de Clientes
 */
class ClienteController {
  /**
   * GET /api/clientes
   * Lista todos os clientes
   */
  listar = asyncHandler(async (req, res) => {
    const clientes = await clienteService.listar(req.query);

    res.json({
      success: true,
      data: clientes,
      total: clientes.length,
    });
  });

  /**
   * GET /api/clientes/:id
   * Busca cliente por ID
   */
  buscarPorId = asyncHandler(async (req, res) => {
    const cliente = await clienteService.buscarPorId(req.params.id);

    res.json({
      success: true,
      data: cliente,
    });
  });

  /**
   * GET /api/clientes/telefone/:telefone
   * Busca cliente por telefone
   */
  buscarPorTelefone = asyncHandler(async (req, res) => {
    const cliente = await clienteService.buscarPorTelefone(req.params.telefone);

    if (!cliente) {
      return res.json({
        success: true,
        data: null,
        message: 'Cliente não encontrado',
      });
    }

    res.json({
      success: true,
      data: cliente,
    });
  });

  /**
   * POST /api/clientes
   * Cria novo cliente
   */
  criar = asyncHandler(async (req, res) => {
    const cliente = await clienteService.criar(req.body);

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: cliente,
    });
  });

  /**
   * PUT /api/clientes/:id
   * Atualiza cliente
   */
  atualizar = asyncHandler(async (req, res) => {
    const cliente = await clienteService.atualizar(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: cliente,
    });
  });

  /**
   * DELETE /api/clientes/:id
   * Deleta cliente
   */
  deletar = asyncHandler(async (req, res) => {
    const resultado = await clienteService.deletar(req.params.id);

    res.json({
      success: true,
      message: resultado.message,
    });
  });
}

export default new ClienteController();
