import pedidoService from '../services/pedido.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Controller de Pedidos
 */
class PedidoController {
  /**
   * GET /api/pedidos
   * Lista pedidos com filtros
   */
  listar = asyncHandler(async (req, res) => {
    const pedidos = await pedidoService.listar(req.query);

    res.json({
      success: true,
      data: pedidos,
      total: pedidos.length,
    });
  });

  /**
   * GET /api/pedidos/:id
   * Busca pedido por ID
   */
  buscarPorId = asyncHandler(async (req, res) => {
    const pedido = await pedidoService.buscarPorId(req.params.id);

    res.json({
      success: true,
      data: pedido,
    });
  });

  /**
   * POST /api/pedidos
   * Cria novo pedido
   */
  criar = asyncHandler(async (req, res) => {
    const io = req.app.get('io');
    const pedido = await pedidoService.criar(req.body, io);

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso',
      data: pedido,
    });
  });

  /**
   * PATCH /api/pedidos/:id/status
   * Atualiza status do pedido
   */
  atualizarStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const io = req.app.get('io');
    
    const pedido = await pedidoService.atualizarStatus(req.params.id, status, io);

    res.json({
      success: true,
      message: `Pedido marcado como "${status}"`,
      data: pedido,
    });
  });

  /**
   * POST /api/pedidos/:id/cancelar
   * Cancela pedido
   */
  cancelar = asyncHandler(async (req, res) => {
    const { motivo } = req.body;
    const io = req.app.get('io');
    
    const pedido = await pedidoService.cancelar(req.params.id, motivo, io);

    res.json({
      success: true,
      message: 'Pedido cancelado com sucesso',
      data: pedido,
    });
  });

  /**
   * POST /api/pedidos/:id/finalizar
   * Finaliza pedido (marca como pago/entregue)
   */
  finalizar = asyncHandler(async (req, res) => {
    const io = req.app.get('io');
    const pedido = await pedidoService.finalizar(req.params.id, io);

    res.json({
      success: true,
      message: 'Pedido finalizado com sucesso',
      data: pedido,
    });
  });
}

export default new PedidoController();
