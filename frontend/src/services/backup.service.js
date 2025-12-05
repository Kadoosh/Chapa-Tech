import api from './api';

const backupService = {
  // Obter configuração
  obterConfig: async () => {
    const response = await api.get('/backup/config');
    return response.data;
  },

  // Atualizar configuração
  atualizarConfig: async (config) => {
    const response = await api.put('/backup/config', config);
    return response.data;
  },

  // Criar backup manual
  criarBackup: async () => {
    const response = await api.post('/backup/criar');
    return response.data;
  },

  // Listar backups
  listarBackups: async () => {
    const response = await api.get('/backup/listar');
    return response.data;
  },

  // Deletar backup
  deletarBackup: async (arquivo) => {
    const response = await api.delete(`/backup/${arquivo}`);
    return response.data;
  },

  // Restaurar backup
  restaurarBackup: async (arquivo) => {
    const response = await api.post(`/backup/restaurar/${arquivo}`);
    return response.data;
  },

  // Limpar backups antigos
  limparBackups: async () => {
    const response = await api.post('/backup/limpar');
    return response.data;
  },

  // URL de download
  getDownloadUrl: (arquivo) => {
    return `${api.defaults.baseURL}/backup/download/${arquivo}`;
  },
};

export default backupService;
