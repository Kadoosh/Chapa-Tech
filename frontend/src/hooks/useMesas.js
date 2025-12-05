import { useQuery } from '@tanstack/react-query';
import mesasService from '../services/mesas.service';

export function useMesas(params = {}) {
  return useQuery({
    queryKey: ['mesas', params],
    queryFn: () => mesasService.listar(params),
    staleTime: 1000 * 30, // 30 segundos
  });
}

export function useMesa(id) {
  return useQuery({
    queryKey: ['mesa', id],
    queryFn: () => mesasService.buscar(id),
    enabled: !!id,
  });
}
