import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Service de Produtos
 */
class ProdutoService {
  /**
   * Lista todos os produtos
   * @param {Object} filtros - Filtros opcionais (categoriaId, disponivel, destaque, busca)
   */
  async listar(filtros = {}) {
    const { categoriaId, disponivel, destaque, busca } = filtros;

    const where = {};

    if (categoriaId) {
      where.categoriaId = parseInt(categoriaId);
    }

    if (disponivel !== undefined) {
      where.disponivel = disponivel === 'true' || disponivel === true;
    }

    if (destaque !== undefined) {
      where.destaque = destaque === 'true' || destaque === true;
    }

    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { descricao: { contains: busca, mode: 'insensitive' } },
      ];
    }

    const produtos = await prisma.produto.findMany({
      where,
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
            cor: true,
            icone: true,
          },
        },
      },
      orderBy: [
        { categoria: { ordem: 'asc' } },
        { ordem: 'asc' },
        { nome: 'asc' },
      ],
    });

    return produtos;
  }

  /**
   * Busca produto por ID
   * @param {number} id - ID do produto
   */
  async buscarPorId(id) {
    const produto = await prisma.produto.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: true,
      },
    });

    if (!produto) {
      throw new AppError('Produto não encontrado', 404);
    }

    return produto;
  }

  /**
   * Cria novo produto
   * @param {Object} dados - Dados do produto
   */
  async criar(dados) {
    const { nome, descricao, ingredientes, preco, categoriaId, imagens, ordem, disponivel, destaque } = dados;

    // Verificar se categoria existe
    const categoria = await prisma.categoria.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria) {
      throw new AppError('Categoria não encontrada', 404);
    }

    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        ingredientes: ingredientes || null,
        preco: parseFloat(preco),
        categoriaId,
        imagens: imagens || null,
        ordem: ordem || 0,
        disponivel: disponivel !== undefined ? disponivel : true,
        destaque: destaque || false,
      },
      include: {
        categoria: true,
      },
    });

    return produto;
  }

  /**
   * Atualiza produto
   * @param {number} id - ID do produto
   * @param {Object} dados - Dados para atualizar
   */
  async atualizar(id, dados) {
    const produtoExistente = await this.buscarPorId(id);

    const { nome, descricao, ingredientes, preco, categoriaId, imagens, ordem, disponivel, destaque } = dados;

    // Se mudar categoria, verificar se existe
    if (categoriaId && categoriaId !== produtoExistente.categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: categoriaId },
      });

      if (!categoria) {
        throw new AppError('Categoria não encontrada', 404);
      }
    }

    const produto = await prisma.produto.update({
      where: { id: parseInt(id) },
      data: {
        ...(nome && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(ingredientes !== undefined && { ingredientes }),
        ...(preco && { preco: parseFloat(preco) }),
        ...(categoriaId && { categoriaId }),
        ...(imagens !== undefined && { imagens }),
        ...(ordem !== undefined && { ordem }),
        ...(disponivel !== undefined && { disponivel }),
        ...(destaque !== undefined && { destaque }),
      },
      include: {
        categoria: true,
      },
    });

    return produto;
  }

  /**
   * Deleta produto
   * @param {number} id - ID do produto
   */
  async deletar(id) {
    await this.buscarPorId(id);

    // Verificar se produto está em algum pedido
    const produtoEmPedidos = await prisma.itemPedido.findFirst({
      where: { produtoId: parseInt(id) },
    });

    if (produtoEmPedidos) {
      throw new AppError(
        'Não é possível deletar produto que está em pedidos. Desative-o em vez disso.',
        400
      );
    }

    await prisma.produto.delete({
      where: { id: parseInt(id) },
    });

    return { message: 'Produto deletado com sucesso' };
  }

  /**
   * Alterna disponibilidade do produto
   * @param {number} id - ID do produto
   */
  async alternarDisponibilidade(id) {
    const produto = await this.buscarPorId(id);

    const produtoAtualizado = await prisma.produto.update({
      where: { id: parseInt(id) },
      data: { disponivel: !produto.disponivel },
      include: {
        categoria: true,
      },
    });

    return produtoAtualizado;
  }

  /**
   * Lista produtos em destaque
   */
  async listarDestaques() {
    const produtos = await prisma.produto.findMany({
      where: {
        destaque: true,
        disponivel: true,
      },
      include: {
        categoria: true,
      },
      orderBy: {
        ordem: 'asc',
      },
      take: 10,
    });

    return produtos;
  }
}

export default new ProdutoService();
