import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Service de Mesas
 */
class MesaService {
  /**
   * Lista todas as mesas
   * @param {string} status - Filtro por status (livre, ocupada, reservada)
   */
  async listar(status = null) {
    const where = {};

    if (status) {
      where.status = status;
    }

    const mesas = await prisma.mesa.findMany({
      where,
      include: {
        pedidos: {
          where: {
            status: {
              notIn: ['finalizado', 'cancelado'],
            },
          },
          take: 1,
          orderBy: {
            criadoEm: 'desc',
          },
          select: {
            id: true,
            numero: true,
            total: true,
            status: true,
            criadoEm: true,
            cliente: {
              select: {
                id: true,
                nome: true,
                telefone: true,
              },
            },
          },
        },
      },
      orderBy: {
        numero: 'asc',
      },
    });

    // Transformar para adicionar pedidoAtual como primeiro pedido ativo
    return mesas.map(mesa => ({
      ...mesa,
      pedidoAtual: mesa.pedidos[0] || null,
    }));
  }

  /**
   * Busca mesa por ID
   * @param {number} id - ID da mesa
   */
  async buscarPorId(id) {
    const mesa = await prisma.mesa.findUnique({
      where: { id: parseInt(id) },
      include: {
        pedidos: {
          where: {
            status: {
              notIn: ['finalizado', 'cancelado'],
            },
          },
          take: 1,
          orderBy: {
            criadoEm: 'desc',
          },
          include: {
            cliente: true,
            itens: {
              include: {
                produto: true,
              },
            },
          },
        },
      },
    });

    if (!mesa) {
      throw new AppError('Mesa não encontrada', 404);
    }

    return {
      ...mesa,
      pedidoAtual: mesa.pedidos[0] || null,
    };
  }

  /**
   * Busca mesa por número
   * @param {number} numero - Número da mesa
   */
  async buscarPorNumero(numero) {
    const mesa = await prisma.mesa.findUnique({
      where: { numero: parseInt(numero) },
      include: {
        pedidos: {
          where: {
            status: {
              notIn: ['finalizado', 'cancelado'],
            },
          },
          take: 1,
          orderBy: {
            criadoEm: 'desc',
          },
        },
      },
    });

    if (!mesa) return null;

    return {
      ...mesa,
      pedidoAtual: mesa.pedidos[0] || null,
    };
  }

  /**
   * Cria nova mesa
   * @param {Object} dados - Dados da mesa
   */
  async criar(dados) {
    const { numero, capacidade, localizacao } = dados;

    // Verificar se número já existe
    const mesaExistente = await prisma.mesa.findUnique({
      where: { numero: parseInt(numero) },
    });

    if (mesaExistente) {
      throw new AppError('Já existe uma mesa com este número', 409);
    }

    const mesa = await prisma.mesa.create({
      data: {
        numero: parseInt(numero),
        capacidade: parseInt(capacidade),
        localizacao: localizacao || null,
        status: 'livre',
      },
    });

    return mesa;
  }

  /**
   * Atualiza mesa
   * @param {number} id - ID da mesa
   * @param {Object} dados - Dados para atualizar
   */
  async atualizar(id, dados) {
    await this.buscarPorId(id);

    const { numero, capacidade, localizacao } = dados;

    // Se mudar número, verificar se não conflita
    if (numero) {
      const mesaComNumero = await prisma.mesa.findUnique({
        where: { numero: parseInt(numero) },
      });

      if (mesaComNumero && mesaComNumero.id !== parseInt(id)) {
        throw new AppError('Já existe uma mesa com este número', 409);
      }
    }

    const mesa = await prisma.mesa.update({
      where: { id: parseInt(id) },
      data: {
        ...(numero && { numero: parseInt(numero) }),
        ...(capacidade && { capacidade: parseInt(capacidade) }),
        ...(localizacao !== undefined && { localizacao }),
      },
    });

    return mesa;
  }

  /**
   * Deleta mesa
   * @param {number} id - ID da mesa
   */
  async deletar(id) {
    const mesa = await this.buscarPorId(id);

    if (mesa.status !== 'livre') {
      throw new AppError('Não é possível deletar mesa ocupada ou reservada', 400);
    }

    await prisma.mesa.delete({
      where: { id: parseInt(id) },
    });

    return { message: 'Mesa deletada com sucesso' };
  }

  /**
   * Ocupa mesa (vincula com pedido)
   * @param {number} id - ID da mesa
   * @param {number} pedidoId - ID do pedido
   */
  async ocupar(id, pedidoId) {
    const mesa = await this.buscarPorId(id);

    if (mesa.status !== 'livre') {
      throw new AppError(`Mesa já está ${mesa.status}`, 400);
    }

    const mesaAtualizada = await prisma.mesa.update({
      where: { id: parseInt(id) },
      data: {
        status: 'ocupada',
      },
    });

    // Buscar o pedido relacionado
    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(pedidoId) },
    });

    return {
      ...mesaAtualizada,
      pedidoAtual: pedido,
    };
  }

  /**
   * Libera mesa
   * @param {number} id - ID da mesa
   */
  async liberar(id) {
    await this.buscarPorId(id);

    const mesaAtualizada = await prisma.mesa.update({
      where: { id: parseInt(id) },
      data: {
        status: 'livre',
      },
    });

    return mesaAtualizada;
  }

  /**
   * Reserva mesa
   * @param {number} id - ID da mesa
   */
  async reservar(id) {
    const mesa = await this.buscarPorId(id);

    if (mesa.status !== 'livre') {
      throw new AppError(`Mesa já está ${mesa.status}`, 400);
    }

    const mesaAtualizada = await prisma.mesa.update({
      where: { id: parseInt(id) },
      data: {
        status: 'reservada',
      },
    });

    return mesaAtualizada;
  }
}

export default new MesaService();
