import api from './api';

const clientesService = {
  // Listar clientes
  listar: async (params = {}) => {
    const response = await api.get('/clientes', { params });
    return response.data;
  },

  // Buscar cliente por ID
  buscar: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  // Buscar cliente por telefone
  buscarPorTelefone: async (telefone) => {
    const response = await api.get(`/clientes/telefone/${telefone}`);
    return response.data;
  },

  // Criar cliente
  criar: async (dados) => {
    const response = await api.post('/clientes', dados);
    return response.data;
  },
};

export default clientesService;
