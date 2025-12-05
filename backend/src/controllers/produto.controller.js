import produtoService from '../services/produto.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Controller de Produtos
 */
class ProdutoController {
  /**
   * GET /api/produtos
   * Lista todos os produtos
   */
  listar = asyncHandler(async (req, res) => {
    const produtos = await produtoService.listar(req.query);

    res.json({
      success: true,
      data: produtos,
      total: produtos.length,
    });
  });

  /**
   * GET /api/produtos/destaques
   * Lista produtos em destaque
   */
  listarDestaques = asyncHandler(async (req, res) => {
    const produtos = await produtoService.listarDestaques();

    res.json({
      success: true,
      data: produtos,
    });
  });

  /**
   * GET /api/produtos/:id
   * Busca produto por ID
   */
  buscarPorId = asyncHandler(async (req, res) => {
    const produto = await produtoService.buscarPorId(req.params.id);

    res.json({
      success: true,
      data: produto,
    });
  });

  /**
   * POST /api/produtos
   * Cria novo produto
   */
  criar = asyncHandler(async (req, res) => {
    const produto = await produtoService.criar(req.body);

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: produto,
    });
  });

  /**
   * PUT /api/produtos/:id
   * Atualiza produto
   */
  atualizar = asyncHandler(async (req, res) => {
    const produto = await produtoService.atualizar(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: produto,
    });
  });

  /**
   * DELETE /api/produtos/:id
   * Deleta produto
   */
  deletar = asyncHandler(async (req, res) => {
    const resultado = await produtoService.deletar(req.params.id);

    res.json({
      success: true,
      message: resultado.message,
    });
  });

  /**
   * PATCH /api/produtos/:id/disponibilidade
   * Alterna disponibilidade do produto
   */
  alternarDisponibilidade = asyncHandler(async (req, res) => {
    const produto = await produtoService.alternarDisponibilidade(req.params.id);

    res.json({
      success: true,
      message: `Produto ${produto.disponivel ? 'disponibilizado' : 'indisponibilizado'} com sucesso`,
      data: produto,
    });
  });
}

export default new ProdutoController();
