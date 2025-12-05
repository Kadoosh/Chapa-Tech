import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import pedidosService from '../services/pedidos.service';

export function usePedidos(params = {}) {
  return useQuery({
    queryKey: ['pedidos', params],
    queryFn: () => pedidosService.listar(params),
  });
}

export function usePedido(id) {
  return useQuery({
    queryKey: ['pedido', id],
    queryFn: () => pedidosService.buscar(id),
    enabled: !!id,
  });
}

export function useCriarPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados) => pedidosService.criar(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
    },
  });
}

export function useAtualizarStatusPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => pedidosService.atualizarStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motivo }) => pedidosService.cancelar(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
    },
  });
}
