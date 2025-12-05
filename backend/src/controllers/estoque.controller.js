import estoqueService from '../services/estoque.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// ============================================
// ITENS DE ESTOQUE
// ============================================

export const listarItens = asyncHandler(async (req, res) => {
  const { produtoId, alerta, page, limit } = req.query;
  const resultado = await estoqueService.listarItens({ produtoId, alerta, page, limit });
  res.json(resultado);
});

export const buscarItem = asyncHandler(async (req, res) => {
  const item = await estoqueService.buscarItemPorId(req.params.id);
  res.json(item);
});

export const buscarItemPorProduto = asyncHandler(async (req, res) => {
  const item = await estoqueService.buscarItemPorProduto(req.params.produtoId);
  res.json(item);
});

export const criarItem = asyncHandler(async (req, res) => {
  const item = await estoqueService.criarItem(req.body);
  res.status(201).json(item);
});

export const atualizarItem = asyncHandler(async (req, res) => {
  const item = await estoqueService.atualizarItem(req.params.id, req.body);
  res.json(item);
});

export const deletarItem = asyncHandler(async (req, res) => {
  const resultado = await estoqueService.deletarItem(req.params.id);
  res.json(resultado);
});

// ============================================
// MOVIMENTAÇÕES
// ============================================

export const registrarEntrada = asyncHandler(async (req, res) => {
  const { produtoId, quantidade, observacao } = req.body;
  const item = await estoqueService.registrarEntrada(
    produtoId,
    quantidade,
    req.user.id,
    observacao
  );
  res.json(item);
});

export const registrarSaida = asyncHandler(async (req, res) => {
  const { produtoId, quantidade, observacao } = req.body;
  const item = await estoqueService.registrarSaida(
    produtoId,
    quantidade,
    req.user.id,
    observacao
  );
  res.json(item);
});

export const ajustarEstoque = asyncHandler(async (req, res) => {
  const { produtoId, novaQuantidade, motivo } = req.body;
  const item = await estoqueService.ajustarEstoque(
    produtoId,
    novaQuantidade,
    req.user.id,
    motivo
  );
  res.json(item);
});

// ============================================
// RELATÓRIOS E ALERTAS
// ============================================

export const obterAlertas = asyncHandler(async (req, res) => {
  const alertas = await estoqueService.obterAlertas();
  res.json(alertas);
});

export const obterHistorico = asyncHandler(async (req, res) => {
  const { produtoId, usuarioId, dataInicio, dataFim, page, limit } = req.query;
  const resultado = await estoqueService.obterHistoricoMovimentacoes({
    produtoId,
    usuarioId,
    dataInicio,
    dataFim,
    page,
    limit
  });
  res.json(resultado);
});

export const obterValorTotal = asyncHandler(async (req, res) => {
  const resultado = await estoqueService.obterValorTotalEstoque();
  res.json(resultado);
});
