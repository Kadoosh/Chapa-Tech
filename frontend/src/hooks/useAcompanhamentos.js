import { useQuery } from '@tanstack/react-query';
import acompanhamentosService from '../services/acompanhamentos.service';

export function useAcompanhamentos() {
    return useQuery({
        queryKey: ['acompanhamentos'],
        queryFn: () => acompanhamentosService.listar(),
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}
