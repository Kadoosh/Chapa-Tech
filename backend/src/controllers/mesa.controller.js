import mesaService from '../services/mesa.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Controller de Mesas
 */
class MesaController {
  /**
   * GET /api/mesas
   * Lista todas as mesas
   */
  listar = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const mesas = await mesaService.listar(status);

    res.json({
      success: true,
      data: mesas,
      total: mesas.length,
    });
  });

  /**
   * GET /api/mesas/:id
   * Busca mesa por ID
   */
  buscarPorId = asyncHandler(async (req, res) => {
    const mesa = await mesaService.buscarPorId(req.params.id);

    res.json({
      success: true,
      data: mesa,
    });
  });

  /**
   * GET /api/mesas/numero/:numero
   * Busca mesa por número
   */
  buscarPorNumero = asyncHandler(async (req, res) => {
    const mesa = await mesaService.buscarPorNumero(req.params.numero);

    if (!mesa) {
      return res.status(404).json({
        success: false,
        message: 'Mesa não encontrada',
      });
    }

    res.json({
      success: true,
      data: mesa,
    });
  });

  /**
   * POST /api/mesas
   * Cria nova mesa
   */
  criar = asyncHandler(async (req, res) => {
    const mesa = await mesaService.criar(req.body);

    res.status(201).json({
      success: true,
      message: 'Mesa criada com sucesso',
      data: mesa,
    });
  });

  /**
   * PUT /api/mesas/:id
   * Atualiza mesa
   */
  atualizar = asyncHandler(async (req, res) => {
    const mesa = await mesaService.atualizar(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Mesa atualizada com sucesso',
      data: mesa,
    });
  });

  /**
   * DELETE /api/mesas/:id
   * Deleta mesa
   */
  deletar = asyncHandler(async (req, res) => {
    const resultado = await mesaService.deletar(req.params.id);

    res.json({
      success: true,
      message: resultado.message,
    });
  });

  /**
   * PATCH /api/mesas/:id/ocupar
   * Ocupa mesa (vincula com pedido)
   */
  ocupar = asyncHandler(async (req, res) => {
    const { pedidoId } = req.body;
    const mesa = await mesaService.ocupar(req.params.id, pedidoId);

    res.json({
      success: true,
      message: 'Mesa ocupada com sucesso',
      data: mesa,
    });
  });

  /**
   * PATCH /api/mesas/:id/liberar
   * Libera mesa
   */
  liberar = asyncHandler(async (req, res) => {
    const mesa = await mesaService.liberar(req.params.id);

    // Emitir evento Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('mesa_liberada', { mesaId: mesa.id, numero: mesa.numero });
    }

    res.json({
      success: true,
      message: 'Mesa liberada com sucesso',
      data: mesa,
    });
  });

  /**
   * PATCH /api/mesas/:id/reservar
   * Reserva mesa
   */
  reservar = asyncHandler(async (req, res) => {
    const mesa = await mesaService.reservar(req.params.id);

    res.json({
      success: true,
      message: 'Mesa reservada com sucesso',
      data: mesa,
    });
  });
}

export default new MesaController();
