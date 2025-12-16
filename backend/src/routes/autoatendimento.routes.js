import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';
import { apiLimiter } from '../middleware/rateLimit.js';
import prisma from '../config/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = Router();

// ============================================
// VALIDAÇÕES
// ============================================

const criarPedidoValidation = [
    body('tipoAtendimento')
        .isIn(['local', 'viagem'])
        .withMessage('Tipo de atendimento inválido'),
    body('marcador')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 10 })
        .withMessage('Marcador inválido'),
    body('itens')
        .isArray({ min: 1 })
        .withMessage('Pedido deve ter pelo menos um item'),
    body('itens.*.produtoId')
        .isInt({ min: 1 })
        .withMessage('ID do produto inválido')
        .toInt(),
    body('itens.*.quantidade')
        .isInt({ min: 1, max: 50 })
        .withMessage('Quantidade deve ser entre 1 e 50')
        .toInt(),
    body('itens.*.observacao')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 200 })
        .withMessage('Observação muito longa')
        .trim(),
];

// ============================================
// ROTAS PÚBLICAS (não requer autenticação)
// ============================================

/**
 * @route   POST /api/autoatendimento/pedido
 * @desc    Cria pedido do auto atendimento
 * @access  Public (com rate limiting)
 */
router.post(
    '/pedido',
    apiLimiter,
    criarPedidoValidation,
    validate,
    asyncHandler(async (req, res) => {
        const { tipoAtendimento, marcador, itens } = req.body;
        const io = req.app.get('io');

        logger.info('Novo pedido auto atendimento', { tipoAtendimento, marcador, itensCount: itens.length });

        // Buscar mesa pelo marcador (se for local)
        let mesaId = null;
        if (tipoAtendimento === 'local' && marcador) {
            const mesa = await prisma.mesa.findFirst({
                where: {
                    numero: parseInt(marcador),
                    ativa: true,
                },
            });

            if (mesa) {
                mesaId = mesa.id;
                // Marcar mesa como ocupada
                await prisma.mesa.update({
                    where: { id: mesa.id },
                    data: { status: 'ocupada' },
                });
            }
        }

        // Buscar produtos e calcular total
        const produtoIds = itens.map(item => item.produtoId);
        const produtos = await prisma.produto.findMany({
            where: { id: { in: produtoIds }, disponivel: true },
        });

        if (produtos.length !== produtoIds.length) {
            throw new AppError('Um ou mais produtos não estão disponíveis', 400);
        }

        // Calcular total
        let total = 0;
        const itensProcessados = itens.map(item => {
            const produto = produtos.find(p => p.id === item.produtoId);
            const subtotal = Number(produto.preco) * item.quantidade;
            total += subtotal;
            return {
                produtoId: item.produtoId,
                quantidade: item.quantidade,
                precoUnitario: produto.preco,
                observacao: item.observacao || null,
            };
        });

        // Criar pedido
        const pedido = await prisma.pedido.create({
            data: {
                mesaId,
                status: 'aguardando',
                total,
                observacao: tipoAtendimento === 'viagem'
                    ? 'PARA VIAGEM'
                    : `Mesa marcador #${marcador}`,
                origem: 'autoatendimento',
                itens: {
                    create: itensProcessados,
                },
            },
            include: {
                itens: {
                    include: {
                        produto: true,
                    },
                },
                mesa: true,
            },
        });

        logger.info('Pedido auto atendimento criado', { pedidoId: pedido.id, total });

        // Emitir para Socket.IO - notificar cozinha
        if (io) {
            io.emit('novo_pedido', {
                ...pedido,
                tipoAtendimento,
                marcador,
                origem: 'autoatendimento',
            });
        }

        res.status(201).json({
            success: true,
            message: 'Pedido criado com sucesso',
            data: {
                id: pedido.id,
                numero: pedido.id,
                total,
                tipoAtendimento,
                marcador,
                status: pedido.status,
                itens: pedido.itens,
            },
        });
    })
);

/**
 * @route   GET /api/autoatendimento/categorias
 * @desc    Lista categorias disponíveis para auto atendimento
 * @access  Public
 */
router.get(
    '/categorias',
    asyncHandler(async (req, res) => {
        const categorias = await prisma.categoria.findMany({
            where: { ativa: true },
            orderBy: { ordem: 'asc' },
        });

        res.json(categorias);
    })
);

/**
 * @route   GET /api/autoatendimento/produtos
 * @desc    Lista produtos disponíveis para auto atendimento
 * @access  Public
 */
router.get(
    '/produtos',
    asyncHandler(async (req, res) => {
        const produtos = await prisma.produto.findMany({
            where: { disponivel: true },
            include: {
                categoria: true,
            },
            orderBy: [
                { categoria: { ordem: 'asc' } },
                { nome: 'asc' },
            ],
        });

        res.json(produtos);
    })
);

export default router;
