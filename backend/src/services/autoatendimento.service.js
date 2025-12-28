import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Service do Auto Atendimento
 * Contém toda a lógica de negócio para o self-service
 */
class AutoatendimentoService {
    /**
     * Lista categorias ativas para o auto atendimento
     * @returns {Promise<Array>} Lista de categorias
     */
    async listarCategorias() {
        return prisma.categoria.findMany({
            where: { ativa: true },
            orderBy: { ordem: 'asc' },
        });
    }

    /**
     * Lista produtos disponíveis para o auto atendimento
     * @returns {Promise<Array>} Lista de produtos com categoria
     */
    async listarProdutos() {
        return prisma.produto.findMany({
            where: { disponivel: true },
            include: {
                categoria: true,
            },
            orderBy: [
                { categoria: { ordem: 'asc' } },
                { nome: 'asc' },
            ],
        });
    }

    /**
     * Cria pedido do auto atendimento
     * @param {Object} dados - Dados do pedido
     * @param {string} dados.tipoAtendimento - 'local' ou 'viagem'
     * @param {string} dados.marcador - Número do marcador da mesa
     * @param {Array} dados.itens - Itens do pedido
     * @param {Object} io - Instância do Socket.IO
     * @returns {Promise<Object>} Pedido criado
     */
    async criarPedido({ tipoAtendimento, marcador, itens }, io) {
        logger.info('Novo pedido auto atendimento', {
            tipoAtendimento,
            marcador,
            itensCount: itens.length
        });

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

        // Buscar produtos e validar disponibilidade
        const produtoIds = itens.map(item => item.produtoId);
        const produtos = await prisma.produto.findMany({
            where: { id: { in: produtoIds }, disponivel: true },
        });

        if (produtos.length !== produtoIds.length) {
            throw new AppError('Um ou mais produtos não estão disponíveis', 400);
        }

        // Calcular total e processar itens
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

        // Criar pedido no banco
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

        return {
            id: pedido.id,
            numero: pedido.id,
            total,
            tipoAtendimento,
            marcador,
            status: pedido.status,
            itens: pedido.itens,
        };
    }
}

export default new AutoatendimentoService();
