import { useQuery } from '@tanstack/react-query';
import produtosService from '../services/produtos.service';

export function useProdutos(params = {}) {
  return useQuery({
    queryKey: ['produtos', params],
    queryFn: () => produtosService.listar(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: () => produtosService.listarCategorias(),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

export function useProduto(id) {
  return useQuery({
    queryKey: ['produto', id],
    queryFn: () => produtosService.buscar(id),
    enabled: !!id,
  });
}
