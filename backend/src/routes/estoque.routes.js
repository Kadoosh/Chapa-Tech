import express from 'express';
import { body, query } from 'express-validator';
import { validarErros } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermissions, PERMISSIONS } from '../middleware/permissions.js';
import * as estoqueController from '../controllers/estoque.controller.js';

const router = express.Router();

// ============================================
// ROTAS DE ITENS DE ESTOQUE
// ============================================

// Listar itens de estoque
router.get(
  '/',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_ESTOQUE]),
  [
    query('produtoId').optional().isInt().withMessage('ProdutoId deve ser número'),
    query('alerta').optional().isBoolean().withMessage('Alerta deve ser booleano'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page deve ser >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit deve estar entre 1 e 100'),
    validarErros
  ],
  estoqueController.listarItens
);

// Buscar item por ID
router.get(
  '/:id',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_ESTOQUE]),
  estoqueController.buscarItem
);

// Buscar item por produto
router.get(
  '/produto/:produtoId',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_ESTOQUE]),
  estoqueController.buscarItemPorProduto
);

// Criar item de estoque
router.post(
  '/',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_ESTOQUE]),
  [
    body('produtoId').isInt().withMessage('ProdutoId é obrigatório e deve ser número'),
    body('quantidadeAtual').optional().isFloat({ min: 0 }).withMessage('Quantidade deve ser >= 0'),
    body('estoqueMinimo').optional().isFloat({ min: 0 }).withMessage('Estoque mínimo deve ser >= 0'),
    body('estoqueMaximo').optional().isFloat({ min: 0 }).withMessage('Estoque máximo deve ser >= 0'),
    body('unidadeMedida').optional().isString().withMessage('Unidade de medida deve ser texto'),
    body('custoUnitario').optional().isFloat({ min: 0 }).withMessage('Custo unitário deve ser >= 0'),
    body('localizacao').optional().isString().withMessage('Localização deve ser texto'),
    validarErros
  ],
  estoqueController.criarItem
);

// Atualizar item de estoque
router.put(
  '/:id',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_ESTOQUE]),
  [
    body('estoqueMinimo').optional().isFloat({ min: 0 }).withMessage('Estoque mínimo deve ser >= 0'),
    body('estoqueMaximo').optional().isFloat({ min: 0 }).withMessage('Estoque máximo deve ser >= 0'),
    body('unidadeMedida').optional().isString().withMessage('Unidade de medida deve ser texto'),
    body('custoUnitario').optional().isFloat({ min: 0 }).withMessage('Custo unitário deve ser >= 0'),
    body('localizacao').optional().isString().withMessage('Localização deve ser texto'),
    validarErros
  ],
  estoqueController.atualizarItem
);

// Deletar item de estoque
router.delete(
  '/:id',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_ESTOQUE]),
  estoqueController.deletarItem
);

// ============================================
// ROTAS DE MOVIMENTAÇÕES
// ============================================

// Registrar entrada de estoque
router.post(
  '/movimentacao/entrada',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_ESTOQUE]),
  [
    body('produtoId').isInt().withMessage('ProdutoId é obrigatório e deve ser número'),
    body('quantidade').isFloat({ min: 0.01 }).withMessage('Quantidade deve ser maior que 0'),
    body('observacao').optional().isString().withMessage('Observação deve ser texto'),
    validarErros
  ],
  estoqueController.registrarEntrada
);

// Registrar saída de estoque
router.post(
  '/movimentacao/saida',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_ESTOQUE]),
  [
    body('produtoId').isInt().withMessage('ProdutoId é obrigatório e deve ser número'),
    body('quantidade').isFloat({ min: 0.01 }).withMessage('Quantidade deve ser maior que 0'),
    body('observacao').optional().isString().withMessage('Observação deve ser texto'),
    validarErros
  ],
  estoqueController.registrarSaida
);

// Ajustar estoque (inventário)
router.post(
  '/movimentacao/ajuste',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_ESTOQUE]),
  [
    body('produtoId').isInt().withMessage('ProdutoId é obrigatório e deve ser número'),
    body('novaQuantidade').isFloat({ min: 0 }).withMessage('Nova quantidade deve ser >= 0'),
    body('motivo').notEmpty().withMessage('Motivo é obrigatório').isString(),
    validarErros
  ],
  estoqueController.ajustarEstoque
);

// ============================================
// ROTAS DE RELATÓRIOS E ALERTAS
// ============================================

// Obter alertas de estoque baixo
router.get(
  '/relatorios/alertas',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_ESTOQUE, PERMISSIONS.VER_DASHBOARD]),
  estoqueController.obterAlertas
);

// Obter histórico de movimentações
router.get(
  '/relatorios/historico',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_ESTOQUE]),
  [
    query('produtoId').optional().isInt().withMessage('ProdutoId deve ser número'),
    query('usuarioId').optional().isInt().withMessage('UsuarioId deve ser número'),
    query('dataInicio').optional().isISO8601().withMessage('Data início deve ser ISO8601'),
    query('dataFim').optional().isISO8601().withMessage('Data fim deve ser ISO8601'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page deve ser >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit deve estar entre 1 e 100'),
    validarErros
  ],
  estoqueController.obterHistorico
);

// Obter valor total em estoque
router.get(
  '/relatorios/valor-total',
  authenticate,
  requirePermissions([PERMISSIONS.GERENCIAR_ESTOQUE, PERMISSIONS.VER_DASHBOARD]),
  estoqueController.obterValorTotal
);

export default router;
