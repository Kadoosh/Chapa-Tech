import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useAdmin = () => {
  const queryClient = useQueryClient();

  // PRODUTOS
  const criarProduto = useMutation({
    mutationFn: (dados) => api.post('/produtos', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });

  const atualizarProduto = useMutation({
    mutationFn: ({ id, dados }) => api.put(`/produtos/${id}`, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });

  const deletarProduto = useMutation({
    mutationFn: (id) => api.delete(`/produtos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });

  // CATEGORIAS
  const criarCategoria = useMutation({
    mutationFn: (dados) => api.post('/produtos/categorias/criar', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  const atualizarCategoria = useMutation({
    mutationFn: ({ id, dados }) => api.put(`/categorias/${id}`, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  const deletarCategoria = useMutation({
    mutationFn: (id) => api.delete(`/categorias/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  // MESAS
  const criarMesa = useMutation({
    mutationFn: (dados) => api.post('/mesas', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
    },
  });

  const atualizarMesa = useMutation({
    mutationFn: ({ id, dados }) => api.put(`/mesas/${id}`, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
    },
  });

  const deletarMesa = useMutation({
    mutationFn: (id) => api.delete(`/mesas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] });
    },
  });

  // USUÁRIOS
  const criarUsuario = useMutation({
    mutationFn: (dados) => api.post('/usuarios', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const atualizarUsuario = useMutation({
    mutationFn: ({ id, dados }) => api.put(`/usuarios/${id}`, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  return {
    // Produtos
    criarProduto,
    atualizarProduto,
    deletarProduto,
    // Categorias
    criarCategoria,
    atualizarCategoria,
    deletarCategoria,
    // Mesas
    criarMesa,
    atualizarMesa,
    deletarMesa,
    // Usuários
    criarUsuario,
    atualizarUsuario,
  };
};
