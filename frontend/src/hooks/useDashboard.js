import { useQuery } from '@tanstack/react-query';
import dashboardService from '../services/dashboard.service';

export const useKPIs = (periodo = 'hoje') => {
  return useQuery({
    queryKey: ['dashboard', 'kpis', periodo],
    queryFn: () => dashboardService.obterKPIs(periodo),
    staleTime: 60000, // 1 minuto
  });
};

export const useFaturamento = (periodo = 'semana') => {
  return useQuery({
    queryKey: ['dashboard', 'faturamento', periodo],
    queryFn: () => dashboardService.obterFaturamento(periodo),
    staleTime: 60000,
  });
};

export const useTopProdutos = (limite = 10) => {
  return useQuery({
    queryKey: ['dashboard', 'top-produtos', limite],
    queryFn: () => dashboardService.obterTopProdutos(limite),
    staleTime: 60000,
  });
};

export const useResumoVendas = (periodo = 'hoje') => {
  return useQuery({
    queryKey: ['dashboard', 'resumo-vendas', periodo],
    queryFn: () => dashboardService.obterResumoVendas(periodo),
    staleTime: 60000,
  });
};

export const useTempoMedioPreparo = () => {
  return useQuery({
    queryKey: ['dashboard', 'tempo-medio-preparo'],
    queryFn: () => dashboardService.obterTempoMedioPreparo(),
    staleTime: 60000,
  });
};

export const useOcupacaoMesas = () => {
  return useQuery({
    queryKey: ['dashboard', 'ocupacao-mesas'],
    queryFn: () => dashboardService.obterOcupacaoMesas(),
    staleTime: 30000, // 30 segundos
  });
};

export const useStatusPedidos = () => {
  return useQuery({
    queryKey: ['dashboard', 'status-pedidos'],
    queryFn: () => dashboardService.obterStatusPedidos(),
    staleTime: 30000,
  });
};

export const useClientesAtivos = (periodo = 'mes') => {
  return useQuery({
    queryKey: ['dashboard', 'clientes-ativos', periodo],
    queryFn: () => dashboardService.obterClientesAtivos(periodo),
    staleTime: 60000,
  });
};

export const useCategoriaMaisVendida = () => {
  return useQuery({
    queryKey: ['dashboard', 'categoria-mais-vendida'],
    queryFn: () => dashboardService.obterCategoriaMaisVendida(),
    staleTime: 60000,
  });
};
