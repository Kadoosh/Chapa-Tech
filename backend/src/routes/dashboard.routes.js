import express from 'express';
import { query } from 'express-validator';
import { validarErros } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermissions, PERMISSIONS } from '../middleware/permissions.js';
import * as dashboardController from '../controllers/dashboard.controller.js';

const router = express.Router();

// Middleware comum: requer autenticação e permissão de dashboard
const requireDashboard = [
  authenticate,
  requirePermissions([PERMISSIONS.VER_DASHBOARD])
];

// ============================================
// ROTAS DE VENDAS
// ============================================

// Resumo de vendas (hoje ou período customizado)
router.get(
  '/vendas/resumo',
  ...requireDashboard,
  [
    query('dataInicio').optional().isISO8601().withMessage('Data início deve ser ISO8601'),
    query('dataFim').optional().isISO8601().withMessage('Data fim deve ser ISO8601'),
    validarErros
  ],
  dashboardController.obterResumoVendas
);

// Vendas por período (últimos 7, 30, 90 dias)
router.get(
  '/vendas/periodo',
  ...requireDashboard,
  [
    query('dias').optional().isInt({ min: 1, max: 365 }).withMessage('Dias deve estar entre 1 e 365'),
    validarErros
  ],
  dashboardController.obterVendasPorPeriodo
);

// Produtos mais vendidos
router.get(
  '/vendas/produtos-mais-vendidos',
  ...requireDashboard,
  [
    query('limite').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve estar entre 1 e 50'),
    query('dataInicio').optional().isISO8601().withMessage('Data início deve ser ISO8601'),
    query('dataFim').optional().isISO8601().withMessage('Data fim deve ser ISO8601'),
    validarErros
  ],
  dashboardController.obterProdutosMaisVendidos
);

// Categoria mais vendida
router.get(
  '/vendas/categoria-mais-vendida',
  ...requireDashboard,
  [
    query('dataInicio').optional().isISO8601().withMessage('Data início deve ser ISO8601'),
    query('dataFim').optional().isISO8601().withMessage('Data fim deve ser ISO8601'),
    validarErros
  ],
  dashboardController.obterCategoriaMaisVendida
);

// ============================================
// ROTAS OPERACIONAIS
// ============================================

// Tempo médio de preparo
router.get(
  '/operacional/tempo-medio-preparo',
  ...requireDashboard,
  [
    query('dataInicio').optional().isISO8601().withMessage('Data início deve ser ISO8601'),
    query('dataFim').optional().isISO8601().withMessage('Data fim deve ser ISO8601'),
    validarErros
  ],
  dashboardController.obterTempoMedioPreparo
);

// Taxa de ocupação de mesas
router.get(
  '/operacional/ocupacao-mesas',
  ...requireDashboard,
  dashboardController.obterTaxaOcupacaoMesas
);

// Status dos pedidos (hoje)
router.get(
  '/operacional/status-pedidos',
  ...requireDashboard,
  dashboardController.obterStatusPedidos
);

// ============================================
// ROTAS DE CLIENTES
// ============================================

// Clientes ativos
router.get(
  '/clientes/ativos',
  ...requireDashboard,
  [
    query('dataInicio').optional().isISO8601().withMessage('Data início deve ser ISO8601'),
    query('dataFim').optional().isISO8601().withMessage('Data fim deve ser ISO8601'),
    validarErros
  ],
  dashboardController.obterClientesAtivos
);

// Novos clientes
router.get(
  '/clientes/novos',
  ...requireDashboard,
  [
    query('dataInicio').optional().isISO8601().withMessage('Data início deve ser ISO8601'),
    query('dataFim').optional().isISO8601().withMessage('Data fim deve ser ISO8601'),
    validarErros
  ],
  dashboardController.obterNovosClientes
);

// ============================================
// DASHBOARD GERAL
// ============================================

// Dashboard geral (todos os KPIs principais)
router.get(
  '/geral',
  ...requireDashboard,
  [
    query('dataInicio').optional().isISO8601().withMessage('Data início deve ser ISO8601'),
    query('dataFim').optional().isISO8601().withMessage('Data fim deve ser ISO8601'),
    validarErros
  ],
  dashboardController.obterDashboardGeral
);

export default router;
