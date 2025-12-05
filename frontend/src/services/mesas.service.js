import api from './api';

const mesasService = {
  // Listar todas as mesas
  listar: async (params = {}) => {
    const response = await api.get('/mesas', { params });
    return response.data;
  },

  // Buscar mesa por ID
  buscar: async (id) => {
    const response = await api.get(`/mesas/${id}`);
    return response.data;
  },

  // Atualizar status da mesa
  atualizarStatus: async (id, dados) => {
    const response = await api.patch(`/mesas/${id}/status`, dados);
    return response.data;
  },
};

export default mesasService;
