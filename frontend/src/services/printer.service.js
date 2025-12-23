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

  // Testar conexão de uma área específica
  testarConexao: async (area = 'cozinha') => {
    const response = await api.post(`/printer/testar?area=${area}`);
    return response.data;
  },

  // Imprimir pedido (vai para cozinha)
  imprimirPedido: async (pedidoId) => {
    const response = await api.post(`/printer/imprimir/pedido/${pedidoId}`);
    return response.data;
  },

  // Imprimir comprovante (vai para caixa)
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

  // Imprimir página de teste em uma área específica
  imprimirTeste: async (area = 'cozinha') => {
    const response = await api.post(`/printer/teste-impressao?area=${area}`);
    return response.data;
  },
};

export default printerService;
