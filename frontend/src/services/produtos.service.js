import api from './api';

const produtosService = {
  // Listar todos os produtos
  listar: async (params = {}) => {
    const response = await api.get('/produtos', { params });
    return response.data;
  },

  // Buscar produto por ID
  buscar: async (id) => {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  // Listar categorias
  listarCategorias: async () => {
    const response = await api.get('/categorias');
    return response.data;
  },
};

export default produtosService;
