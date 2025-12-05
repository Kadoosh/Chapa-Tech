import axios from 'axios';
import { getToken, clearStorage } from '../utils/storage';

// Configuração base do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
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

export default api;
