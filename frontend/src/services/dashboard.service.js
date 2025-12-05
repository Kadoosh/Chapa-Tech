import api from './api';

const dashboardService = {
  // Obter KPIs gerais (dashboard completo)
  obterKPIs: async (periodo = 'hoje') => {
    // Calcular datas com base no período
    const { dataInicio, dataFim } = calcularDatas(periodo);
    const response = await api.get('/dashboard/geral', {
      params: { dataInicio, dataFim },
    });
    return response.data;
  },

  // Obter faturamento por período (vendas dos últimos X dias)
  obterFaturamento: async (periodo = 'semana') => {
    const dias = periodoDias(periodo);
    const response = await api.get('/dashboard/vendas/periodo', {
      params: { dias },
    });
    return response.data;
  },

  // Obter produtos mais vendidos
  obterTopProdutos: async (limite = 10) => {
    const response = await api.get('/dashboard/vendas/produtos-mais-vendidos', {
      params: { limite },
    });
    return response.data;
  },

  // Obter resumo de vendas
  obterResumoVendas: async (periodo = 'hoje') => {
    const { dataInicio, dataFim } = calcularDatas(periodo);
    const response = await api.get('/dashboard/vendas/resumo', {
      params: { dataInicio, dataFim },
    });
    return response.data;
  },

  // Obter tempo médio de preparo
  obterTempoMedioPreparo: async () => {
    const response = await api.get('/dashboard/operacional/tempo-medio-preparo');
    return response.data;
  },

  // Obter taxa de ocupação de mesas
  obterOcupacaoMesas: async () => {
    const response = await api.get('/dashboard/operacional/ocupacao-mesas');
    return response.data;
  },

  // Obter status dos pedidos
  obterStatusPedidos: async () => {
    const response = await api.get('/dashboard/operacional/status-pedidos');
    return response.data;
  },

  // Obter clientes ativos
  obterClientesAtivos: async (periodo = 'mes') => {
    const { dataInicio, dataFim } = calcularDatas(periodo);
    const response = await api.get('/dashboard/clientes/ativos', {
      params: { dataInicio, dataFim },
    });
    return response.data;
  },

  // Obter categoria mais vendida
  obterCategoriaMaisVendida: async () => {
    const response = await api.get('/dashboard/vendas/categoria-mais-vendida');
    return response.data;
  },
};

// Função auxiliar para calcular datas com base no período
function calcularDatas(periodo) {
  const hoje = new Date();
  const dataFim = hoje.toISOString();
  let dataInicio;

  switch (periodo) {
    case 'hoje':
      dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString();
      break;
    case 'semana':
      dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case 'mes':
      dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
      break;
    case 'ano':
      dataInicio = new Date(hoje.getFullYear(), 0, 1).toISOString();
      break;
    default:
      dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString();
  }

  return { dataInicio, dataFim };
}

// Função auxiliar para converter período em dias
function periodoDias(periodo) {
  switch (periodo) {
    case 'hoje':
      return 1;
    case 'semana':
      return 7;
    case 'mes':
      return 30;
    case 'ano':
      return 365;
    default:
      return 7;
  }
}

export default dashboardService;
