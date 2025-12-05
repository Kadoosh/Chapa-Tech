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
        { nome: { contains: busca, mode: 'insensitive' } },
        { telefone: { contains: busca } },
        { cpf: { contains: busca } },
        { email: { contains: busca, mode: 'insensitive' } },
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
            numeroComanda: true,
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
    const cliente = await prisma.cliente.findUnique({
      where: { telefone },
    });

    return cliente;
  }

  /**
   * Cria novo cliente
   * @param {Object} dados - Dados do cliente
   */
  async criar(dados) {
    const { nome, telefone, email, cpf, endereco, observacoes } = dados;

    // Verificar se telefone já existe
    if (telefone) {
      const clienteExistente = await prisma.cliente.findUnique({
        where: { telefone },
      });

      if (clienteExistente) {
        throw new AppError('Já existe um cliente com este telefone', 409);
      }
    }

    // Verificar se CPF já existe
    if (cpf) {
      const clienteComCPF = await prisma.cliente.findUnique({
        where: { cpf },
      });

      if (clienteComCPF) {
        throw new AppError('Já existe um cliente com este CPF', 409);
      }
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        telefone,
        email: email || null,
        cpf: cpf || null,
        endereco: endereco || null,
        observacoes: observacoes || null,
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

    const { nome, telefone, email, cpf, endereco, observacoes } = dados;

    // Se mudar telefone, verificar se não conflita
    if (telefone) {
      const clienteComTelefone = await prisma.cliente.findUnique({
        where: { telefone },
      });

      if (clienteComTelefone && clienteComTelefone.id !== parseInt(id)) {
        throw new AppError('Já existe um cliente com este telefone', 409);
      }
    }

    // Se mudar CPF, verificar se não conflita
    if (cpf) {
      const clienteComCPF = await prisma.cliente.findUnique({
        where: { cpf },
      });

      if (clienteComCPF && clienteComCPF.id !== parseInt(id)) {
        throw new AppError('Já existe um cliente com este CPF', 409);
      }
    }

    const cliente = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: {
        ...(nome && { nome }),
        ...(telefone && { telefone }),
        ...(email !== undefined && { email }),
        ...(cpf !== undefined && { cpf }),
        ...(endereco !== undefined && { endereco }),
        ...(observacoes !== undefined && { observacoes }),
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
