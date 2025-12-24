import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Service de Clientes
 */
class ClienteService {
  /**
   * Lista todos os clientes
   * @param {Object} filtros - Filtros opcionais (busca)
   */
  async listar(filtros = {}) {
    const { busca } = filtros;
    const where = {};

    if (busca) {
      where.OR = [
        { nome: { contains: busca } },
        { sobrenome: { contains: busca } },
        { telefone: { contains: busca } },
      ];
    }

    const clientes = await prisma.cliente.findMany({
      where,
      include: {
        _count: {
          select: {
            pedidos: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return clientes;
  }

  /**
   * Busca cliente por ID
   * @param {number} id - ID do cliente
   */
  async buscarPorId(id) {
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(id) },
      include: {
        pedidos: {
          take: 10,
          orderBy: { criadoEm: 'desc' },
          select: {
            id: true,
            numero: true,
            status: true,
            total: true,
            criadoEm: true,
          },
        },
        _count: {
          select: {
            pedidos: true,
          },
        },
      },
    });

    if (!cliente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    return cliente;
  }

  /**
   * Busca cliente por telefone
   * @param {string} telefone - Telefone do cliente
   */
  async buscarPorTelefone(telefone) {
    const cliente = await prisma.cliente.findFirst({
      where: { telefone },
    });

    return cliente;
  }

  /**
   * Cria novo cliente
   * @param {Object} dados - Dados do cliente
   */
  async criar(dados) {
    const { nome, sobrenome, telefone } = dados;

    // Validar nome obrigatório
    if (!nome || !nome.trim()) {
      throw new AppError('Nome é obrigatório', 400);
    }

    // Verificar se telefone já existe (se fornecido)
    if (telefone) {
      const clienteExistente = await prisma.cliente.findFirst({
        where: { telefone },
      });

      if (clienteExistente) {
        throw new AppError('Já existe um cliente com este telefone', 409);
      }
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome: nome.trim(),
        sobrenome: sobrenome?.trim() || null,
        telefone: telefone || null,
      },
    });

    return cliente;
  }

  /**
   * Atualiza cliente
   * @param {number} id - ID do cliente
   * @param {Object} dados - Dados para atualizar
   */
  async atualizar(id, dados) {
    await this.buscarPorId(id);

    const { nome, sobrenome, telefone } = dados;

    // Se mudar telefone, verificar se não conflita
    if (telefone) {
      const clienteComTelefone = await prisma.cliente.findFirst({
        where: { telefone },
      });

      if (clienteComTelefone && clienteComTelefone.id !== parseInt(id)) {
        throw new AppError('Já existe um cliente com este telefone', 409);
      }
    }

    const cliente = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: {
        ...(nome && { nome: nome.trim() }),
        ...(sobrenome !== undefined && { sobrenome: sobrenome?.trim() || null }),
        ...(telefone !== undefined && { telefone: telefone || null }),
      },
    });

    return cliente;
  }

  /**
   * Deleta cliente
   * @param {number} id - ID do cliente
   */
  async deletar(id) {
    await this.buscarPorId(id);

    // Verificar se tem pedidos
    const pedidosCliente = await prisma.pedido.count({
      where: { clienteId: parseInt(id) },
    });

    if (pedidosCliente > 0) {
      throw new AppError(
        `Não é possível deletar cliente com ${pedidosCliente} pedido(s) registrado(s).`,
        400
      );
    }

    await prisma.cliente.delete({
      where: { id: parseInt(id) },
    });

    return { message: 'Cliente deletado com sucesso' };
  }
}

export default new ClienteService();
