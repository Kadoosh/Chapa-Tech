import api from './api';

const printerService = {
  // Obter configuração
  obterConfig: async () => {
    const response = await api.get('/printer/config');
    return response.data;
  },

  // Atualizar configuração
  atualizarConfig: async (config) => {
    const response = await api.put('/printer/config', config);
    return response.data;
  },

  // Testar conexão
  testarConexao: async () => {
    const response = await api.post('/printer/testar');
    return response.data;
  },

  // Imprimir pedido
  imprimirPedido: async (pedidoId) => {
    const response = await api.post(`/printer/imprimir/pedido/${pedidoId}`);
    return response.data;
  },

  // Imprimir comprovante
  imprimirComprovante: async (pedidoId) => {
    const response = await api.post(`/printer/imprimir/comprovante/${pedidoId}`);
    return response.data;
  },

  // Preview pedido
  previewPedido: async (pedidoId) => {
    const response = await api.get(`/printer/preview/pedido/${pedidoId}`);
    return response.data;
  },

  // Preview comprovante
  previewComprovante: async (pedidoId) => {
    const response = await api.get(`/printer/preview/comprovante/${pedidoId}`);
    return response.data;
  },
};

export default printerService;
