import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Service de Categorias
 */
class CategoriaService {
  /**
   * Lista todas as categorias
   * @param {boolean} apenasAtivas - Filtrar apenas categorias ativas
   */
  async listar(apenasAtivas = false) {
    const where = {};

    if (apenasAtivas) {
      where.ativa = true;
    }

    const categorias = await prisma.categoria.findMany({
      where,
      include: {
        _count: {
          select: {
            produtos: true,
          },
        },
      },
      orderBy: {
        ordem: 'asc',
      },
    });

    return categorias;
  }

  /**
   * Busca categoria por ID
   * @param {number} id - ID da categoria
   */
  async buscarPorId(id) {
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
      include: {
        produtos: {
          where: { disponivel: true },
          orderBy: { ordem: 'asc' },
        },
        _count: {
          select: {
            produtos: true,
          },
        },
      },
    });

    if (!categoria) {
      throw new AppError('Categoria não encontrada', 404);
    }

    return categoria;
  }

  /**
   * Cria nova categoria
   * @param {Object} dados - Dados da categoria
   */
  async criar(dados) {
    const { nome, descricao, icone, cor, ordem } = dados;

    // Verificar se nome já existe
    const categoriaExistente = await prisma.categoria.findUnique({
      where: { nome },
    });

    if (categoriaExistente) {
      throw new AppError('Já existe uma categoria com este nome', 409);
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome,
        descricao,
        icone: icone || null,
        cor: cor || '#000000',
        ordem: ordem || 0,
      },
    });

    return categoria;
  }

  /**
   * Atualiza categoria
   * @param {number} id - ID da categoria
   * @param {Object} dados - Dados para atualizar
   */
  async atualizar(id, dados) {
    await this.buscarPorId(id);

    const { nome, descricao, icone, cor, ordem, ativa } = dados;

    // Se mudar nome, verificar se não conflita
    if (nome) {
      const categoriaComNome = await prisma.categoria.findUnique({
        where: { nome },
      });

      if (categoriaComNome && categoriaComNome.id !== parseInt(id)) {
        throw new AppError('Já existe uma categoria com este nome', 409);
      }
    }

    const categoria = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: {
        ...(nome && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(icone !== undefined && { icone }),
        ...(cor && { cor }),
        ...(ordem !== undefined && { ordem }),
        ...(ativa !== undefined && { ativa }),
      },
      include: {
        _count: {
          select: {
            produtos: true,
          },
        },
      },
    });

    return categoria;
  }

  /**
   * Deleta categoria
   * @param {number} id - ID da categoria
   */
  async deletar(id) {
    await this.buscarPorId(id);

    // Verificar se tem produtos
    const produtosNaCategoria = await prisma.produto.count({
      where: { categoriaId: parseInt(id) },
    });

    if (produtosNaCategoria > 0) {
      throw new AppError(
        `Não é possível deletar categoria com ${produtosNaCategoria} produto(s). Mova os produtos ou desative a categoria.`,
        400
      );
    }

    await prisma.categoria.delete({
      where: { id: parseInt(id) },
    });

    return { message: 'Categoria deletada com sucesso' };
  }

  /**
   * Alterna status ativo/inativo da categoria
   * @param {number} id - ID da categoria
   */
  async alternarStatus(id) {
    const categoria = await this.buscarPorId(id);

    const categoriaAtualizada = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: { ativa: !categoria.ativa },
    });

    return categoriaAtualizada;
  }

  /**
   * Reordena categorias
   * @param {Array} ordens - Array com {id, ordem}
   */
  async reordenar(ordens) {
    const operacoes = ordens.map(({ id, ordem }) =>
      prisma.categoria.update({
        where: { id: parseInt(id) },
        data: { ordem: parseInt(ordem) },
      })
    );

    await prisma.$transaction(operacoes);

    return { message: 'Categorias reordenadas com sucesso' };
  }
}

export default new CategoriaService();
