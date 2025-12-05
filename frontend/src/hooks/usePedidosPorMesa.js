import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Buscar pedidos de uma mesa específica
export const usePedidosPorMesa = (mesaId, enabled = true) => {
  return useQuery({
    queryKey: ['pedidos', 'mesa', mesaId],
    queryFn: async () => {
      const response = await api.get('/pedidos', {
        params: {
          mesaId,
          status: 'preparando,pronto,entregue',
        },
      });
      return response.data;
    },
    enabled: enabled && !!mesaId,
    refetchInterval: 30000, // Refresh a cada 30s
  });
};

// Marcar pedido como pago
export const useMarcarComoPago = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pedidoId) => {
      const response = await api.patch(`/pedidos/${pedidoId}/status`, {
        status: 'pago',
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
    },
  });
};

// Buscar todas as mesas com pedidos ativos
export const useMesasComPedidos = () => {
  return useQuery({
    queryKey: ['mesas', 'com-pedidos'],
    queryFn: async () => {
      const response = await api.get('/mesas', {
        params: { status: 'ocupada' },
      });
      return response.data;
    },
    refetchInterval: 15000, // Refresh a cada 15s
  });
};
