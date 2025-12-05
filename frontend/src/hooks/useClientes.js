import { useQuery, useMutation } from '@tanstack/react-query';
import clientesService from '../services/clientes.service';

export function useClientes(params = {}) {
  return useQuery({
    queryKey: ['clientes', params],
    queryFn: () => clientesService.listar(params),
  });
}

export function useCliente(id) {
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: () => clientesService.buscar(id),
    enabled: !!id,
  });
}

export function useClientePorTelefone(telefone) {
  return useQuery({
    queryKey: ['cliente-telefone', telefone],
    queryFn: () => clientesService.buscarPorTelefone(telefone),
    enabled: !!telefone && telefone.length >= 10,
    retry: false,
  });
}

export function useCriarCliente() {
  return useMutation({
    mutationFn: (dados) => clientesService.criar(dados),
  });
}
