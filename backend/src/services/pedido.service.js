import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { SOCKET_EVENTS, emitToAll, emitToNamespace } from '../config/socket.js';

/**
 * Service de Pedidos
 */
class PedidoService {
  /**
   * Lista pedidos com filtros
   * @param {Object} filtros - status, mesaId, clienteId, dataInicio, dataFim
   */
  async listar(filtros = {}) {
    const { status, mesaId, clienteId, dataInicio, dataFim } = filtros;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (mesaId) {
      where.mesaId = parseInt(mesaId);
    }

    if (clienteId) {
      where.clienteId = parseInt(clienteId);
    }

    if (dataInicio && dataFim) {
      where.criadoEm = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      };
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            telefone: true,
          },
        },
        mesa: {
          select: {
            id: true,
            numero: true,
          },
        },
        itens: {
          include: {
            produto: {
              select: {
                id: true,
                nome: true,
                preco: true,
              },
            },
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    return pedidos;
  }

  /**
   * Busca pedido por ID
   * @param {number} id - ID do pedido
   */
  async buscarPorId(id) {
    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        mesa: true,
        itens: {
          include: {
            produto: {
              include: {
                categoria: true,
              },
            },
          },
        },
      },
    });

    if (!pedido) {
      throw new AppError('Pedido não encontrado', 404);
    }

    return pedido;
  }

  /**
   * Cria novo pedido
   * @param {Object} dados - Dados do pedido
   * @param {Object} io - Instância do Socket.IO
   */
  async criar(dados, io) {
    const { clienteId, mesaId, itens, observacoes, tipo } = dados;

    // Validar itens
    if (!itens || itens.length === 0) {
      throw new AppError('Pedido deve ter pelo menos um item', 400);
    }

    // Verificar se cliente existe
    if (clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
      });

      if (!cliente) {
        throw new AppError('Cliente não encontrado', 404);
      }
    }

    // Verificar se mesa existe e está disponível
    if (mesaId) {
      const mesa = await prisma.mesa.findUnique({
        where: { id: mesaId },
      });

      if (!mesa) {
        throw new AppError('Mesa não encontrada', 404);
      }

      if (mesa.status === 'ocupada' && !mesa.pedidoAtualId) {
        throw new AppError('Mesa já está ocupada', 400);
      }
    }

    // Calcular total
    let total = 0;
    for (const item of itens) {
      const produto = await prisma.produto.findUnique({
        where: { id: item.produtoId },
      });

      if (!produto) {
        throw new AppError(`Produto com ID ${item.produtoId} não encontrado`, 404);
      }

      if (!produto.disponivel) {
        throw new AppError(`Produto "${produto.nome}" não está disponível`, 400);
      }

      total += produto.preco * item.quantidade;
    }

    // Gerar número da comanda (sequencial do dia)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const pedidosHoje = await prisma.pedido.count({
      where: {
        criadoEm: {
          gte: hoje,
        },
      },
    });

    const numeroComanda = pedidosHoje + 1;

    // Criar pedido com itens em uma transação
    const pedido = await prisma.$transaction(async (tx) => {
      const novoPedido = await tx.pedido.create({
        data: {
          numeroComanda,
          clienteId: clienteId || null,
          mesaId: mesaId || null,
          tipo: tipo || 'local',
          status: 'aguardando',
          total,
          observacoes: observacoes || null,
        },
      });

      // Criar itens do pedido
      for (const item of itens) {
        const produto = await tx.produto.findUnique({
          where: { id: item.produtoId },
        });

        await tx.itemPedido.create({
          data: {
            pedidoId: novoPedido.id,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnitario: produto.preco,
            observacoes: item.observacoes || null,
          },
        });
      }

      // Se tiver mesa, atualizar status
      if (mesaId) {
        await tx.mesa.update({
          where: { id: mesaId },
          data: {
            status: 'ocupada',
            pedidoAtualId: novoPedido.id,
          },
        });
      }

      return novoPedido;
    });

    // Buscar pedido completo
    const pedidoCompleto = await this.buscarPorId(pedido.id);

    // Emitir evento Socket.IO
    if (io) {
      emitToAll(io, SOCKET_EVENTS.NOVO_PEDIDO, pedidoCompleto);
      emitToNamespace(io, '/cozinha', SOCKET_EVENTS.NOVO_PEDIDO, pedidoCompleto);
    }

    return pedidoCompleto;
  }

  /**
   * Atualiza status do pedido
   * @param {number} id - ID do pedido
   * @param {string} novoStatus - Novo status
   * @param {Object} io - Instância do Socket.IO
   */
  async atualizarStatus(id, novoStatus, io) {
    const pedido = await this.buscarPorId(id);

    const statusPermitidos = ['aguardando', 'preparando', 'pronto', 'entregue', 'cancelado'];
    if (!statusPermitidos.includes(novoStatus)) {
      throw new AppError('Status inválido', 400);
    }

    // Validar transições de status
    const transicoesValidas = {
      aguardando: ['preparando', 'cancelado'],
      preparando: ['pronto', 'cancelado'],
      pronto: ['entregue', 'cancelado'],
      entregue: [],
      cancelado: [],
    };

    if (!transicoesValidas[pedido.status].includes(novoStatus)) {
      throw new AppError(
        `Não é possível mudar status de "${pedido.status}" para "${novoStatus}"`,
        400
      );
    }

    const pedidoAtualizado = await prisma.pedido.update({
      where: { id: parseInt(id) },
      data: { status: novoStatus },
      include: {
        cliente: true,
        mesa: true,
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    // Emitir eventos Socket.IO
    if (io) {
      emitToAll(io, SOCKET_EVENTS.PEDIDO_ATUALIZADO, pedidoAtualizado);

      if (novoStatus === 'pronto') {
        emitToAll(io, SOCKET_EVENTS.PEDIDO_PRONTO, pedidoAtualizado);
        emitToNamespace(io, '/atendimento', SOCKET_EVENTS.PEDIDO_PRONTO, pedidoAtualizado);
      }

      if (novoStatus === 'cancelado') {
        emitToAll(io, SOCKET_EVENTS.PEDIDO_CANCELADO, pedidoAtualizado);
      }

      if (novoStatus === 'entregue') {
        emitToAll(io, SOCKET_EVENTS.PEDIDO_ENTREGUE, pedidoAtualizado);
      }
    }

    return pedidoAtualizado;
  }

  /**
   * Cancela pedido
   * @param {number} id - ID do pedido
   * @param {string} motivo - Motivo do cancelamento
   * @param {Object} io - Instância do Socket.IO
   */
  async cancelar(id, motivo, io) {
    const pedido = await this.buscarPorId(id);

    if (['entregue', 'cancelado'].includes(pedido.status)) {
      throw new AppError(`Não é possível cancelar pedido ${pedido.status}`, 400);
    }

    const pedidoCancelado = await prisma.pedido.update({
      where: { id: parseInt(id) },
      data: {
        status: 'cancelado',
        observacoes: motivo ? `CANCELADO: ${motivo}` : 'Cancelado',
      },
      include: {
        cliente: true,
        mesa: true,
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    // Liberar mesa se tiver
    if (pedido.mesaId) {
      await prisma.mesa.update({
        where: { id: pedido.mesaId },
        data: {
          status: 'livre',
          pedidoAtualId: null,
        },
      });
    }

    // Emitir evento Socket.IO
    if (io) {
      emitToAll(io, SOCKET_EVENTS.PEDIDO_CANCELADO, pedidoCancelado);
    }

    return pedidoCancelado;
  }

  /**
   * Finaliza pedido (marca como pago/entregue)
   * @param {number} id - ID do pedido
   * @param {Object} io - Instância do Socket.IO
   */
  async finalizar(id, io) {
    const pedido = await this.buscarPorId(id);

    if (pedido.status !== 'pronto') {
      throw new AppError('Pedido deve estar "pronto" para ser finalizado', 400);
    }

    const pedidoFinalizado = await prisma.pedido.update({
      where: { id: parseInt(id) },
      data: { status: 'entregue' },
      include: {
        cliente: true,
        mesa: true,
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    // Liberar mesa se tiver
    if (pedido.mesaId) {
      await prisma.mesa.update({
        where: { id: pedido.mesaId },
        data: {
          status: 'livre',
          pedidoAtualId: null,
        },
      });

      if (io) {
        emitToAll(io, 'mesa_liberada', { mesaId: pedido.mesaId });
      }
    }

    // Emitir evento Socket.IO
    if (io) {
      emitToAll(io, SOCKET_EVENTS.PEDIDO_ENTREGUE, pedidoFinalizado);
    }

    return pedidoFinalizado;
  }
}

export default new PedidoService();
