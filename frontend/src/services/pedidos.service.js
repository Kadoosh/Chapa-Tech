import api from './api';

const pedidosService = {
  // Listar pedidos
  listar: async (params = {}) => {
    const response = await api.get('/pedidos', { params });
    return response.data;
  },

  // Buscar pedido por ID
  buscar: async (id) => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  },

  // Criar pedido
  criar: async (dados) => {
    const response = await api.post('/pedidos', dados);
    return response.data;
  },

  // Atualizar status do pedido
  atualizarStatus: async (id, status) => {
    const response = await api.patch(`/pedidos/${id}/status`, { status });
    return response.data;
  },

  // Cancelar pedido
  cancelar: async (id, motivo) => {
    const response = await api.patch(`/pedidos/${id}/cancelar`, { motivo });
    return response.data;
  },
};

export default pedidosService;
