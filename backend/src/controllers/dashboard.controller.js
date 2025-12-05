import kpiService from '../services/kpi.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// ============================================
// KPIs DE VENDAS
// ============================================

export const obterResumoVendas = asyncHandler(async (req, res) => {
  const { dataInicio, dataFim } = req.query;
  const resultado = await kpiService.obterResumoVendas(dataInicio, dataFim);
  res.json(resultado);
});

export const obterVendasPorPeriodo = asyncHandler(async (req, res) => {
  const { dias } = req.query;
  const resultado = await kpiService.obterVendasPorPeriodo(parseInt(dias) || 7);
  res.json(resultado);
});

export const obterProdutosMaisVendidos = asyncHandler(async (req, res) => {
  const { limite, dataInicio, dataFim } = req.query;
  const resultado = await kpiService.obterProdutosMaisVendidos(
    parseInt(limite) || 10,
    dataInicio,
    dataFim
  );
  res.json(resultado);
});

export const obterCategoriaMaisVendida = asyncHandler(async (req, res) => {
  const { dataInicio, dataFim } = req.query;
  const resultado = await kpiService.obterCategoriaMaisVendida(dataInicio, dataFim);
  res.json(resultado);
});

// ============================================
// KPIs OPERACIONAIS
// ============================================

export const obterTempoMedioPreparo = asyncHandler(async (req, res) => {
  const { dataInicio, dataFim } = req.query;
  const resultado = await kpiService.obterTempoMedioPreparo(dataInicio, dataFim);
  res.json(resultado);
});

export const obterTaxaOcupacaoMesas = asyncHandler(async (req, res) => {
  const resultado = await kpiService.obterTaxaOcupacaoMesas();
  res.json(resultado);
});

export const obterStatusPedidos = asyncHandler(async (req, res) => {
  const resultado = await kpiService.obterStatusPedidos();
  res.json(resultado);
});

// ============================================
// KPIs DE CLIENTES
// ============================================

export const obterClientesAtivos = asyncHandler(async (req, res) => {
  const { dataInicio, dataFim } = req.query;
  const resultado = await kpiService.obterClientesAtivos(dataInicio, dataFim);
  res.json(resultado);
});

export const obterNovosClientes = asyncHandler(async (req, res) => {
  const { dataInicio, dataFim } = req.query;
  const resultado = await kpiService.obterNovosClientes(dataInicio, dataFim);
  res.json(resultado);
});

// ============================================
// DASHBOARD GERAL
// ============================================

export const obterDashboardGeral = asyncHandler(async (req, res) => {
  const { dataInicio, dataFim } = req.query;
  const resultado = await kpiService.obterDashboardGeral(dataInicio, dataFim);
  res.json(resultado);
});
