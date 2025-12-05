import categoriaService from '../services/categoria.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Controller de Categorias
 */
class CategoriaController {
  /**
   * GET /api/categorias
   * Lista todas as categorias
   */
  listar = asyncHandler(async (req, res) => {
    const { apenasAtivas } = req.query;
    const categorias = await categoriaService.listar(apenasAtivas === 'true');

    res.json({
      success: true,
      data: categorias,
      total: categorias.length,
    });
  });

  /**
   * GET /api/categorias/:id
   * Busca categoria por ID com seus produtos
   */
  buscarPorId = asyncHandler(async (req, res) => {
    const categoria = await categoriaService.buscarPorId(req.params.id);

    res.json({
      success: true,
      data: categoria,
    });
  });

  /**
   * POST /api/categorias
   * Cria nova categoria
   */
  criar = asyncHandler(async (req, res) => {
    const categoria = await categoriaService.criar(req.body);

    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: categoria,
    });
  });

  /**
   * PUT /api/categorias/:id
   * Atualiza categoria
   */
  atualizar = asyncHandler(async (req, res) => {
    const categoria = await categoriaService.atualizar(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: categoria,
    });
  });

  /**
   * DELETE /api/categorias/:id
   * Deleta categoria
   */
  deletar = asyncHandler(async (req, res) => {
    const resultado = await categoriaService.deletar(req.params.id);

    res.json({
      success: true,
      message: resultado.message,
    });
  });

  /**
   * PATCH /api/categorias/:id/status
   * Alterna status ativo/inativo
   */
  alternarStatus = asyncHandler(async (req, res) => {
    const categoria = await categoriaService.alternarStatus(req.params.id);

    res.json({
      success: true,
      message: `Categoria ${categoria.ativa ? 'ativada' : 'desativada'} com sucesso`,
      data: categoria,
    });
  });

  /**
   * POST /api/categorias/reordenar
   * Reordena categorias
   */
  reordenar = asyncHandler(async (req, res) => {
    const resultado = await categoriaService.reordenar(req.body.ordens);

    res.json({
      success: true,
      message: resultado.message,
    });
  });
}

export default new CategoriaController();
