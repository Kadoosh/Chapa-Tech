import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Listar produtos com estoque
export const useProdutosComEstoque = (params = {}) => {
  return useQuery({
    queryKey: ['produtos', 'com-estoque', params],
    queryFn: async () => {
      const response = await api.get('/produtos', { params });
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

// Listar movimentações (histórico)
export const useMovimentacoes = (params = {}) => {
  return useQuery({
    queryKey: ['movimentacoes', params],
    queryFn: async () => {
      const response = await api.get('/estoque/relatorios/historico', { params });
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Criar movimentação (entrada)
export const useCriarEntrada = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados) => {
      const response = await api.post('/estoque/movimentacao/entrada', dados);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
    },
  });
};

// Criar movimentação (saída)
export const useCriarSaida = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados) => {
      const response = await api.post('/estoque/movimentacao/saida', dados);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
    },
  });
};

// Criar movimentação genérica (entrada ou saída)
export const useCriarMovimentacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados) => {
      const endpoint = dados.tipo === 'entrada' 
        ? '/estoque/movimentacao/entrada' 
        : '/estoque/movimentacao/saida';
      const response = await api.post(endpoint, {
        produtoId: dados.produtoId,
        quantidade: dados.quantidade,
        observacao: dados.observacao,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
    },
  });
};

// Ajustar estoque manualmente
export const useAjustarEstoque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ produtoId, quantidade, motivo }) => {
      const response = await api.post('/estoque/movimentacao/ajuste', {
        produtoId,
        novaQuantidade: quantidade,
        motivo,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
    },
  });
};

// Produtos com estoque baixo
export const useProdutosEstoqueBaixo = () => {
  return useQuery({
    queryKey: ['produtos', 'estoque-baixo'],
    queryFn: async () => {
      const response = await api.get('/estoque/relatorios/alertas');
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

// Resumo do estoque (valor total)
export const useResumoEstoque = () => {
  return useQuery({
    queryKey: ['estoque', 'resumo'],
    queryFn: async () => {
      const response = await api.get('/estoque/relatorios/valor-total');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Listar itens de estoque
export const useItensEstoque = (params = {}) => {
  return useQuery({
    queryKey: ['estoque', 'itens', params],
    queryFn: async () => {
      const response = await api.get('/estoque', { params });
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};
