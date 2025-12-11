import axios from 'axios';
import { getToken, clearStorage } from '../utils/storage';

// Detectar a URL da API dinamicamente
// Se acessando via IP (ex: 192.168.1.171:5173), usa o mesmo IP para a API
const getApiUrl = () => {
  // Se tiver variável de ambiente definida, usa ela
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Em desenvolvimento, detecta automaticamente baseado no host atual
  const host = window.location.hostname;
  const apiPort = 3000;

  return `http://${host}:${apiPort}/api`;
};

// Configuração base do Axios
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ INTERCEPTORS ============

// Request interceptor - Adiciona o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Trata erros globais
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Erros de autenticação (401)
    if (error.response?.status === 401) {
      clearStorage();
      window.location.href = '/login';
    }

    // Erros de autorização (403)
    if (error.response?.status === 403) {
      console.error('Acesso negado:', error.response.data.mensagem);
    }

    // Erros de servidor (500+)
    if (error.response?.status >= 500) {
      console.error('Erro no servidor:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// ============ UPLOAD ============

/**
 * Upload de imagem
 * @param {File} file - Arquivo de imagem
 * @returns {Promise<{url: string, filename: string}>}
 */
export const uploadImagem = async (file) => {
  const formData = new FormData();
  formData.append('imagem', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

/**
 * Deletar imagem
 * @param {string} filename - Nome do arquivo
 */
export const deletarImagem = async (filename) => {
  await api.delete(`/upload/${filename}`);
};

export default api;
