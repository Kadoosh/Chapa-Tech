import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

class EstoqueService {
  // ============================================
  // ITENS DE ESTOQUE
  // ============================================
  
  async listarItens({ produtoId, alerta, page = 1, limit = 50 }) {
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (produtoId) {
      where.produtoId = parseInt(produtoId);
    }
    
    const [itens, total] = await Promise.all([
      prisma.itemEstoque.findMany({
        where,
        include: {
          produto: {
            select: {
              id: true,
              nome: true,
              categoria: {
                select: {
                  id: true,
                  nome: true
                }
              }
            }
          }
        },
        orderBy: { produto: { nome: 'asc' } },
        skip,
        take: limit
      }),
      prisma.itemEstoque.count({ where })
    ]);
    
    // Se filtro de alerta estiver ativo, filtra itens com estoque baixo
    let itensFiltrados = itens;
    if (alerta === 'true' || alerta === true) {
      itensFiltrados = itens.filter(item => item.quantidadeAtual <= item.estoqueMinimo);
    }
    
    return {
      itens: itensFiltrados,
      total: alerta ? itensFiltrados.length : total,
      page,
      totalPages: Math.ceil((alerta ? itensFiltrados.length : total) / limit),
      alertas: itens.filter(item => item.quantidadeAtual <= item.estoqueMinimo).length
    };
  }
  
  async buscarItemPorId(id) {
    const item = await prisma.itemEstoque.findUnique({
      where: { id: parseInt(id) },
      include: {
        produto: {
          include: {
            categoria: true
          }
        }
      }
    });
    
    if (!item) {
      throw new AppError('Item de estoque não encontrado', 404);
    }
    
    return item;
  }
  
  async buscarItemPorProduto(produtoId) {
    const item = await prisma.itemEstoque.findUnique({
      where: { produtoId: parseInt(produtoId) },
      include: {
        produto: {
          include: {
            categoria: true
          }
        }
      }
    });
    
    if (!item) {
      throw new AppError('Item de estoque não encontrado para este produto', 404);
    }
    
    return item;
  }
  
  async criarItem(data) {
    // Verifica se produto existe
    const produto = await prisma.produto.findUnique({
      where: { id: data.produtoId }
    });
    
    if (!produto) {
      throw new AppError('Produto não encontrado', 404);
    }
    
    // Verifica se já existe item de estoque para este produto
    const itemExistente = await prisma.itemEstoque.findUnique({
      where: { produtoId: data.produtoId }
    });
    
    if (itemExistente) {
      throw new AppError('Já existe item de estoque para este produto', 400);
    }
    
    return prisma.itemEstoque.create({
      data: {
        produtoId: data.produtoId,
        quantidadeAtual: data.quantidadeAtual || 0,
        estoqueMinimo: data.estoqueMinimo || 5,
        estoqueMaximo: data.estoqueMaximo || 100,
        unidadeMedida: data.unidadeMedida || 'un',
        custoUnitario: data.custoUnitario || 0,
        localizacao: data.localizacao
      },
      include: {
        produto: {
          include: {
            categoria: true
          }
        }
      }
    });
  }
  
  async atualizarItem(id, data) {
    const item = await prisma.itemEstoque.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!item) {
      throw new AppError('Item de estoque não encontrado', 404);
    }
    
    return prisma.itemEstoque.update({
      where: { id: parseInt(id) },
      data,
      include: {
        produto: {
          include: {
            categoria: true
          }
        }
      }
    });
  }
  
  async deletarItem(id) {
    const item = await prisma.itemEstoque.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!item) {
      throw new AppError('Item de estoque não encontrado', 404);
    }
    
    await prisma.itemEstoque.delete({
      where: { id: parseInt(id) }
    });
    
    return { message: 'Item de estoque deletado com sucesso' };
  }
  
  // ============================================
  // MOVIMENTAÇÕES DE ESTOQUE
  // ============================================
  
  async registrarEntrada(produtoId, quantidade, usuarioId, observacao) {
    const item = await prisma.itemEstoque.findUnique({
      where: { produtoId: parseInt(produtoId) }
    });
    
    if (!item) {
      throw new AppError('Item de estoque não encontrado', 404);
    }
    
    const novaQuantidade = item.quantidadeAtual + quantidade;
    
    // Atualiza quantidade em estoque
    const itemAtualizado = await prisma.itemEstoque.update({
      where: { produtoId: parseInt(produtoId) },
      data: {
        quantidadeAtual: novaQuantidade,
        ultimaMovimentacao: new Date()
      },
      include: {
        produto: true
      }
    });
    
    // Registra log da ação
    await prisma.logAcao.create({
      data: {
        usuarioId,
        acao: 'estoque_entrada',
        entidade: 'ItemEstoque',
        entidadeId: item.id,
        detalhes: `Entrada de ${quantidade} ${item.unidadeMedida} - ${itemAtualizado.produto.nome}${observacao ? ` (${observacao})` : ''}`,
        dados: {
          produtoId,
          quantidade,
          quantidadeAnterior: item.quantidadeAtual,
          novaQuantidade,
          observacao
        }
      }
    });
    
    return itemAtualizado;
  }
  
  async registrarSaida(produtoId, quantidade, usuarioId, observacao) {
    const item = await prisma.itemEstoque.findUnique({
      where: { produtoId: parseInt(produtoId) }
    });
    
    if (!item) {
      throw new AppError('Item de estoque não encontrado', 404);
    }
    
    if (item.quantidadeAtual < quantidade) {
      throw new AppError('Quantidade insuficiente em estoque', 400);
    }
    
    const novaQuantidade = item.quantidadeAtual - quantidade;
    
    // Atualiza quantidade em estoque
    const itemAtualizado = await prisma.itemEstoque.update({
      where: { produtoId: parseInt(produtoId) },
      data: {
        quantidadeAtual: novaQuantidade,
        ultimaMovimentacao: new Date()
      },
      include: {
        produto: true
      }
    });
    
    // Registra log da ação
    await prisma.logAcao.create({
      data: {
        usuarioId,
        acao: 'estoque_saida',
        entidade: 'ItemEstoque',
        entidadeId: item.id,
        detalhes: `Saída de ${quantidade} ${item.unidadeMedida} - ${itemAtualizado.produto.nome}${observacao ? ` (${observacao})` : ''}`,
        dados: {
          produtoId,
          quantidade,
          quantidadeAnterior: item.quantidadeAtual,
          novaQuantidade,
          observacao
        }
      }
    });
    
    return itemAtualizado;
  }
  
  async ajustarEstoque(produtoId, novaQuantidade, usuarioId, motivo) {
    const item = await prisma.itemEstoque.findUnique({
      where: { produtoId: parseInt(produtoId) }
    });
    
    if (!item) {
      throw new AppError('Item de estoque não encontrado', 404);
    }
    
    const quantidadeAnterior = item.quantidadeAtual;
    const diferenca = novaQuantidade - quantidadeAnterior;
    const tipoMovimento = diferenca > 0 ? 'Ajuste positivo' : 'Ajuste negativo';
    
    // Atualiza quantidade em estoque
    const itemAtualizado = await prisma.itemEstoque.update({
      where: { produtoId: parseInt(produtoId) },
      data: {
        quantidadeAtual: novaQuantidade,
        ultimaMovimentacao: new Date()
      },
      include: {
        produto: true
      }
    });
    
    // Registra log da ação
    await prisma.logAcao.create({
      data: {
        usuarioId,
        acao: 'estoque_ajuste',
        entidade: 'ItemEstoque',
        entidadeId: item.id,
        detalhes: `${tipoMovimento} de ${Math.abs(diferenca)} ${item.unidadeMedida} - ${itemAtualizado.produto.nome}. Motivo: ${motivo}`,
        dados: {
          produtoId,
          quantidadeAnterior,
          novaQuantidade,
          diferenca,
          motivo
        }
      }
    });
    
    return itemAtualizado;
  }
  
  // ============================================
  // RELATÓRIOS E ALERTAS
  // ============================================
  
  async obterAlertas() {
    const itens = await prisma.itemEstoque.findMany({
      where: {
        quantidadeAtual: {
          lte: prisma.itemEstoque.fields.estoqueMinimo
        }
      },
      include: {
        produto: {
          include: {
            categoria: true
          }
        }
      },
      orderBy: { quantidadeAtual: 'asc' }
    });
    
    return itens;
  }
  
  async obterHistoricoMovimentacoes({ produtoId, usuarioId, dataInicio, dataFim, page = 1, limit = 50 }) {
    const skip = (page - 1) * limit;
    
    const where = {
      acao: {
        in: ['estoque_entrada', 'estoque_saida', 'estoque_ajuste']
      }
    };
    
    if (produtoId) {
      where.dados = {
        path: ['produtoId'],
        equals: parseInt(produtoId)
      };
    }
    
    if (usuarioId) {
      where.usuarioId = parseInt(usuarioId);
    }
    
    if (dataInicio || dataFim) {
      where.criadoEm = {};
      if (dataInicio) where.criadoEm.gte = new Date(dataInicio);
      if (dataFim) where.criadoEm.lte = new Date(dataFim);
    }
    
    const [movimentacoes, total] = await Promise.all([
      prisma.logAcao.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        },
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limit
      }),
      prisma.logAcao.count({ where })
    ]);
    
    return {
      movimentacoes,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
  
  async obterValorTotalEstoque() {
    const itens = await prisma.itemEstoque.findMany({
      select: {
        quantidadeAtual: true,
        custoUnitario: true
      }
    });
    
    const valorTotal = itens.reduce((total, item) => {
      return total + (item.quantidadeAtual * item.custoUnitario);
    }, 0);
    
    return {
      valorTotal,
      totalItens: itens.length
    };
  }
}

export default new EstoqueService();
