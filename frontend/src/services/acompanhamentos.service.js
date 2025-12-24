import api from './api';

const acompanhamentosService = {
    listar: async () => {
        const response = await api.get('/acompanhamentos');
        return response.data;
    },

    criar: async (dados) => {
        const response = await api.post('/acompanhamentos', dados);
        return response.data;
    },

    atualizar: async (id, dados) => {
        const response = await api.put(`/acompanhamentos/${id}`, dados);
        return response.data;
    },

    remover: async (id) => {
        const response = await api.delete(`/acompanhamentos/${id}`);
        return response.data;
    },
};

export default acompanhamentosService;
