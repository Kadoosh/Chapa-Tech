import prisma from '../config/database.js';
import { obterInicioFimDia, obterUltimosDias, calcularTempoPreparo } from '../utils/dateHelpers.js';

class KpiService {
  // ============================================
  // KPIs DE VENDAS
  // ============================================
  
  async obterResumoVendas(dataInicio, dataFim) {
    const { inicio, fim } = dataInicio && dataFim 
      ? { inicio: new Date(dataInicio), fim: new Date(dataFim) }
      : obterInicioFimDia();
    
    const pedidos = await prisma.pedido.findMany({
      where: {
        criadoEm: {
          gte: inicio,
          lte: fim
        },
        status: {
          notIn: ['cancelado']
        }
      },
      include: {
        itens: true
      }
    });
    
    const totalVendas = pedidos.reduce((sum, p) => sum + p.total, 0);
    const ticketMedio = pedidos.length > 0 ? totalVendas / pedidos.length : 0;
    
    const pedidosCancelados = await prisma.pedido.count({
      where: {
        criadoEm: {
          gte: inicio,
          lte: fim
        },
        status: 'cancelado'
      }
    });
    
    return {
      totalPedidos: pedidos.length,
      totalVendas,
      ticketMedio,
      pedidosCancelados,
      totalItensVendidos: pedidos.reduce((sum, p) => sum + p.itens.length, 0)
    };
  }
  
  async obterVendasPorPeriodo(dias = 7) {
    const { inicio, fim } = obterUltimosDias(dias);
    
    const pedidos = await prisma.pedido.groupBy({
      by: ['criadoEm'],
      where: {
        criadoEm: {
          gte: inicio,
          lte: fim
        },
        status: {
          notIn: ['cancelado']
        }
      },
      _sum: {
        total: true
      },
      _count: {
        id: true
      }
    });
    
    return pedidos;
  }
  
  async obterProdutosMaisVendidos(limite = 10, dataInicio, dataFim) {
    const { inicio, fim } = dataInicio && dataFim 
      ? { inicio: new Date(dataInicio), fim: new Date(dataFim) }
      : obterUltimosDias(30);
    
    const produtosMaisVendidos = await prisma.itemPedido.groupBy({
      by: ['produtoId'],
      where: {
        pedido: {
          criadoEm: {
            gte: inicio,
            lte: fim
          },
          status: {
            notIn: ['cancelado']
          }
        }
      },
      _sum: {
        quantidade: true,
        subtotal: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantidade: 'desc'
        }
      },
      take: limite
    });
    
    // Busca informações dos produtos
    const produtosComDetalhes = await Promise.all(
      produtosMaisVendidos.map(async (item) => {
        const produto = await prisma.produto.findUnique({
          where: { id: item.produtoId },
          include: {
            categoria: true
          }
        });
        
        return {
          produto,
          quantidadeVendida: item._sum.quantidade,
          totalVendas: item._sum.subtotal,
          numeroVendas: item._count.id
        };
      })
    );
    
    return produtosComDetalhes;
  }
  
  async obterCategoriaMaisVendida(dataInicio, dataFim) {
    const { inicio, fim } = dataInicio && dataFim 
      ? { inicio: new Date(dataInicio), fim: new Date(dataFim) }
      : obterUltimosDias(30);
    
    const itensPedidos = await prisma.itemPedido.findMany({
      where: {
        pedido: {
          criadoEm: {
            gte: inicio,
            lte: fim
          },
          status: {
            notIn: ['cancelado']
          }
        }
      },
      include: {
        produto: {
          include: {
            categoria: true
          }
        }
      }
    });
    
    // Agrupa por categoria
    const vendasPorCategoria = {};
    itensPedidos.forEach(item => {
      const categoriaNome = item.produto.categoria.nome;
      if (!vendasPorCategoria[categoriaNome]) {
        vendasPorCategoria[categoriaNome] = {
          categoria: item.produto.categoria,
          quantidadeVendida: 0,
          totalVendas: 0
        };
      }
      vendasPorCategoria[categoriaNome].quantidadeVendida += item.quantidade;
      vendasPorCategoria[categoriaNome].totalVendas += item.subtotal;
    });
    
    return Object.values(vendasPorCategoria).sort((a, b) => b.totalVendas - a.totalVendas);
  }
  
  // ============================================
  // KPIs OPERACIONAIS
  // ============================================
  
  async obterTempoMedioPreparo(dataInicio, dataFim) {
    const { inicio, fim } = dataInicio && dataFim 
      ? { inicio: new Date(dataInicio), fim: new Date(dataFim) }
      : obterInicioFimDia();
    
    const pedidos = await prisma.pedido.findMany({
      where: {
        criadoEm: {
          gte: inicio,
          lte: fim
        },
        tempoPreparo: {
          not: null
        }
      },
      select: {
        tempoPreparo: true
      }
    });
    
    if (pedidos.length === 0) {
      return { tempoMedio: 0, totalPedidos: 0 };
    }
    
    const tempoTotal = pedidos.reduce((sum, p) => sum + (p.tempoPreparo || 0), 0);
    const tempoMedio = tempoTotal / pedidos.length;
    
    return {
      tempoMedio: Math.round(tempoMedio),
      totalPedidos: pedidos.length,
      tempoMinimo: Math.min(...pedidos.map(p => p.tempoPreparo)),
      tempoMaximo: Math.max(...pedidos.map(p => p.tempoPreparo))
    };
  }
  
  async obterTaxaOcupacaoMesas() {
    const totalMesas = await prisma.mesa.count({
      where: { ativa: true }
    });
    
    const mesasOcupadas = await prisma.mesa.count({
      where: {
        ativa: true,
        status: 'ocupada'
      }
    });
    
    const taxaOcupacao = totalMesas > 0 ? (mesasOcupadas / totalMesas) * 100 : 0;
    
    return {
      totalMesas,
      mesasOcupadas,
      mesasLivres: totalMesas - mesasOcupadas,
      taxaOcupacao: Math.round(taxaOcupacao * 100) / 100
    };
  }
  
  async obterStatusPedidos() {
    const pedidosHoje = await prisma.pedido.findMany({
      where: {
        criadoEm: {
          gte: obterInicioFimDia().inicio
        }
      }
    });
    
    const statusCount = {
      preparando: 0,
      pronto: 0,
      entregue: 0,
      cancelado: 0,
      pago: 0
    };
    
    pedidosHoje.forEach(pedido => {
      statusCount[pedido.status]++;
    });
    
    return {
      total: pedidosHoje.length,
      ...statusCount
    };
  }
  
  // ============================================
  // KPIs DE CLIENTES
  // ============================================
  
  async obterClientesAtivos(dataInicio, dataFim) {
    const { inicio, fim } = dataInicio && dataFim 
      ? { inicio: new Date(dataInicio), fim: new Date(dataFim) }
      : obterUltimosDias(30);
    
    const clientesAtivos = await prisma.cliente.findMany({
      where: {
        ultimaVisita: {
          gte: inicio,
          lte: fim
        }
      },
      include: {
        _count: {
          select: { pedidos: true }
        }
      },
      orderBy: {
        totalGasto: 'desc'
      },
      take: 10
    });
    
    const totalClientes = await prisma.cliente.count({
      where: {
        ultimaVisita: {
          gte: inicio,
          lte: fim
        }
      }
    });
    
    return {
      totalClientesAtivos: totalClientes,
      topClientes: clientesAtivos
    };
  }
  
  async obterNovosClientes(dataInicio, dataFim) {
    const { inicio, fim } = dataInicio && dataFim 
      ? { inicio: new Date(dataInicio), fim: new Date(dataFim) }
      : obterUltimosDias(30);
    
    const novosClientes = await prisma.cliente.count({
      where: {
        primeiraVisita: {
          gte: inicio,
          lte: fim
        }
      }
    });
    
    return { novosClientes };
  }
  
  // ============================================
  // DASHBOARD GERAL
  // ============================================
  
  async obterDashboardGeral(dataInicio, dataFim) {
    const [
      vendas,
      tempoMedioPreparo,
      ocupacaoMesas,
      statusPedidos,
      clientesAtivos,
      produtosMaisVendidos
    ] = await Promise.all([
      this.obterResumoVendas(dataInicio, dataFim),
      this.obterTempoMedioPreparo(dataInicio, dataFim),
      this.obterTaxaOcupacaoMesas(),
      this.obterStatusPedidos(),
      this.obterClientesAtivos(dataInicio, dataFim),
      this.obterProdutosMaisVendidos(5, dataInicio, dataFim)
    ]);
    
    return {
      vendas,
      operacional: {
        tempoMedioPreparo,
        ocupacaoMesas,
        statusPedidos
      },
      clientes: clientesAtivos,
      produtosMaisVendidos
    };
  }
}

export default new KpiService();
