import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { SOCKET_EVENTS, emitToAll, emitToNamespace } from '../config/socket.js';
import printerService from './printer.service.js';

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
      // Suporte a múltiplos status separados por vírgula
      if (status.includes(',')) {
        const statusList = status.split(',').map(s => s.trim());
        where.status = { in: statusList };
      } else {
        where.status = status;
      }
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
            sobrenome: true,
            telefone: true,
          },
        },
        mesa: {
          select: {
            id: true,
            numero: true,
          },
        },
        criadoPor: {
          select: {
            id: true,
            nome: true,
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
        criadoPor: {
          select: {
            id: true,
            nome: true,
          },
        },
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
   * @param {number} criadoPorId - ID do usuário que está criando o pedido
   */
  async criar(dados, io, criadoPorId) {
    const { clienteId, mesaId, itens, observacao, paraViagem } = dados;

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

    // Verificar se mesa existe (mesa ocupada pode receber mais pedidos)
    if (mesaId) {
      const mesa = await prisma.mesa.findUnique({
        where: { id: mesaId },
      });

      if (!mesa) {
        throw new AppError('Mesa não encontrada', 404);
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

    // Gerar número único da comanda (6 dígitos aleatórios, validando unicidade)
    let numero;
    let tentativas = 0;
    const maxTentativas = 10;

    do {
      numero = Math.floor(100000 + Math.random() * 900000).toString();
      const existente = await prisma.pedido.findUnique({
        where: { numero },
        select: { id: true },
      });

      if (!existente) break;
      tentativas++;
    } while (tentativas < maxTentativas);

    if (tentativas >= maxTentativas) {
      throw new AppError('Não foi possível gerar número único para o pedido', 500);
    }

    // Criar pedido com itens em uma transação
    const pedido = await prisma.$transaction(async (tx) => {
      const novoPedido = await tx.pedido.create({
        data: {
          numero,
          mesaId,
          clienteId: clienteId || null,
          criadoPorId,
          status: 'preparando',
          total,
          paraViagem: paraViagem || false,
          observacao: observacao || null,
        },
      });

      // Criar itens do pedido
      for (const item of itens) {
        const produto = await tx.produto.findUnique({
          where: { id: item.produtoId },
        });

        const subtotalItem = produto.preco * item.quantidade;

        await tx.itemPedido.create({
          data: {
            pedidoId: novoPedido.id,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnitario: produto.preco,
            subtotal: subtotalItem,
            observacao: item.observacao || null,
          },
        });
      }

      // Se tiver mesa, atualizar status
      if (mesaId) {
        await tx.mesa.update({
          where: { id: mesaId },
          data: {
            status: 'ocupada',
          },
        });
      }

      return novoPedido;
    });

    // Buscar pedido completo
    const pedidoCompleto = await this.buscarPorId(pedido.id);

    // Emitir evento Socket.IO (versão simplificada sem referências circulares)
    if (io) {
      const pedidoParaSocket = {
        id: pedidoCompleto.id,
        numero: pedidoCompleto.numero,
        status: pedidoCompleto.status,
        total: pedidoCompleto.total,
        observacao: pedidoCompleto.observacao,
        criadoEm: pedidoCompleto.criadoEm,
        mesa: pedidoCompleto.mesa ? {
          id: pedidoCompleto.mesa.id,
          numero: pedidoCompleto.mesa.numero,
        } : null,
        cliente: pedidoCompleto.cliente ? {
          id: pedidoCompleto.cliente.id,
          nome: pedidoCompleto.cliente.nome,
          sobrenome: pedidoCompleto.cliente.sobrenome,
        } : null,
        itens: pedidoCompleto.itens?.map(item => ({
          id: item.id,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          subtotal: item.subtotal,
          observacao: item.observacao,
          produto: item.produto ? {
            id: item.produto.id,
            nome: item.produto.nome,
            preco: item.produto.preco,
          } : null,
        })) || [],
      };

      emitToAll(SOCKET_EVENTS.NOVO_PEDIDO, pedidoParaSocket);
      emitToNamespace('/cozinha', SOCKET_EVENTS.NOVO_PEDIDO, pedidoParaSocket);
    }

    // Impressão automática na cozinha (se habilitado)
    try {
      await printerService.ensureConfigLoaded();
      const printerConfig = printerService.getConfig();
      if (printerConfig.cozinha?.habilitada && printerConfig.cozinha?.autoImprimir) {
        console.log('Impressão automática: enviando pedido para cozinha...');
        await printerService.imprimirPedido(pedidoCompleto);
      }
    } catch (printError) {
      console.error('Erro na impressão automática:', printError.message);
      // Não falha o pedido se impressão falhar
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
      emitToAll(SOCKET_EVENTS.PEDIDO_ATUALIZADO, pedidoAtualizado);

      if (novoStatus === 'pronto') {
        emitToAll(SOCKET_EVENTS.PEDIDO_PRONTO, pedidoAtualizado);
        emitToNamespace('/atendimento', SOCKET_EVENTS.PEDIDO_PRONTO, pedidoAtualizado);
      }

      if (novoStatus === 'cancelado') {
        emitToAll(SOCKET_EVENTS.PEDIDO_CANCELADO, pedidoAtualizado);
      }

      if (novoStatus === 'entregue') {
        emitToAll(SOCKET_EVENTS.PEDIDO_ENTREGUE, pedidoAtualizado);
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
        motivoCancelamento: motivo || 'Cancelado',
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
        },
      });
    }

    // Emitir evento Socket.IO
    if (io) {
      emitToAll(SOCKET_EVENTS.PEDIDO_CANCELADO, pedidoCancelado);
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
        },
      });

      if (io) {
        emitToAll('mesa_liberada', { mesaId: pedido.mesaId });
      }
    }

    // Emitir evento Socket.IO
    if (io) {
      emitToAll(SOCKET_EVENTS.PEDIDO_ENTREGUE, pedidoFinalizado);
    }

    return pedidoFinalizado;
  }
}

export default new PedidoService();
