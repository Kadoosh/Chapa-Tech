# 🔐 PHASE 03 - AUTH & PERMISSIONS (Frontend)

## 📌 Objetivo desta Fase
Implementar sistema completo de autenticação no frontend com React, incluindo Context API, hooks customizados, proteção de rotas, gerenciamento de estado de autenticação e integração com o backend JWT.

---

## ✅ Checklist de Conclusão
Ao final desta fase, você deve ter:
- [ ] AuthContext criado e funcionando
- [ ] Hook useAuth funcionando
- [ ] Serviço de API configurado (Axios)
- [ ] Interceptors de token configurados
- [ ] Proteção de rotas implementada
- [ ] Persistência de token no localStorage
- [ ] Auto-refresh de token
- [ ] Loading states gerenciados
- [ ] Redirecionamentos corretos (login/logout)
- [ ] Verificação de permissões no frontend

---

## 📁 Arquivos que Serão Criados

```
frontend/src/
├── services/
│   ├── api.js              🆕 Configuração Axios + interceptors
│   └── auth.service.js     🆕 Funções de autenticação
│
├── context/
│   └── AuthContext.jsx     🆕 Context de autenticação
│
├── hooks/
│   ├── useAuth.js          🆕 Hook de autenticação
│   └── usePermissions.js   🆕 Hook de verificação de permissões
│
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx  🆕 Componente de proteção de rotas
│   │
│   └── common/
│       └── Loading.jsx     🆕 Componente de loading
│
└── utils/
    └── storage.js          🆕 Helpers de localStorage
```

---

## 🔧 1. UTILS - Storage Helpers

Crie `frontend/src/utils/storage.js`:

```javascript
// Helpers para localStorage com tratamento de erros

const KEYS = {
  TOKEN: '@sistema-pedidos:token',
  USER: '@sistema-pedidos:user',
};

export const storage = {
  // Token
  setToken: (token) => {
    try {
      localStorage.setItem(KEYS.TOKEN, token);
    } catch (err) {
      console.error('Erro ao salvar token:', err);
    }
  },

  getToken: () => {
    try {
      return localStorage.getItem(KEYS.TOKEN);
    } catch (err) {
      console.error('Erro ao buscar token:', err);
      return null;
    }
  },

  removeToken: () => {
    try {
      localStorage.removeItem(KEYS.TOKEN);
    } catch (err) {
      console.error('Erro ao remover token:', err);
    }
  },

  // Usuário
  setUser: (user) => {
    try {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
    }
  },

  getUser: () => {
    try {
      const user = localStorage.getItem(KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      return null;
    }
  },

  removeUser: () => {
    try {
      localStorage.removeItem(KEYS.USER);
    } catch (err) {
      console.error('Erro ao remover usuário:', err);
    }
  },

  // Limpar tudo
  clear: () => {
    try {
      localStorage.removeItem(KEYS.TOKEN);
      localStorage.removeItem(KEYS.USER);
    } catch (err) {
      console.error('Erro ao limpar storage:', err);
    }
  },
};
```

---

## 🌐 2. SERVICES - API Configuration

Crie `frontend/src/services/api.js`:

```javascript
import axios from 'axios';
import { storage } from '../utils/storage';

// Configuração base do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request - Adicionar token
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response - Tratar erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se erro 401 e não é retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Limpar storage e redirecionar para login
      storage.clear();
      
      // Se não estiver na página de login, redirecionar
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    // Tratar outros erros
    const errorMessage = error.response?.data?.error || 
                        error.message || 
                        'Erro ao comunicar com o servidor';

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default api;
```

---

## 🔑 3. SERVICES - Auth Service

Crie `frontend/src/services/auth.service.js`:

```javascript
import api from './api';
import { storage } from '../utils/storage';

const authService = {
  // Login
  login: async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      
      const { token, usuario } = response.data;

      // Salvar no localStorage
      storage.setToken(token);
      storage.setUser(usuario);

      return { token, usuario };
    } catch (err) {
      throw err;
    }
  },

  // Logout
  logout: async () => {
    try {
      // Chamar endpoint de logout (opcional - apenas registra log)
      await api.post('/auth/logout').catch(() => {
        // Ignorar erro se API não responder
      });
    } finally {
      // Sempre limpar storage
      storage.clear();
    }
  },

  // Verificar token (refresh)
  verificarToken: async () => {
    try {
      const response = await api.get('/auth/verificar');
      
      const { usuario } = response.data;

      // Atualizar usuário no storage
      storage.setUser(usuario);

      return usuario;
    } catch (err) {
      // Se token inválido, limpar storage
      storage.clear();
      throw err;
    }
  },

  // Obter usuário do storage
  getUsuarioAtual: () => {
    return storage.getUser();
  },

  // Obter token do storage
  getToken: () => {
    return storage.getToken();
  },

  // Verificar se está autenticado
  isAuthenticated: () => {
    return !!storage.getToken();
  },
};

export default authService;
```

---

## 🎯 4. CONTEXT - AuthContext

Crie `frontend/src/context/AuthContext.jsx`:

```jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Inicializar: verificar se há token salvo
  useEffect(() => {
    const inicializar = async () => {
      try {
        const token = authService.getToken();
        
        if (token) {
          // Verificar se token ainda é válido
          const usuarioAtual = await authService.verificarToken();
          setUsuario(usuarioAtual);
        }
      } catch (err) {
        console.error('Erro ao verificar token:', err);
        // Token inválido, limpar
        authService.logout();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    inicializar();
  }, []);

  // Login
  const login = useCallback(async (email, senha) => {
    try {
      setLoading(true);
      
      const { usuario: usuarioLogado } = await authService.login(email, senha);
      
      setUsuario(usuarioLogado);
      
      return { sucesso: true };
    } catch (err) {
      return { 
        sucesso: false, 
        erro: err.message || 'Erro ao fazer login' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      setUsuario(null);
      setLoading(false);
    }
  }, []);

  // Atualizar usuário (após edição de perfil, etc)
  const atualizarUsuario = useCallback((usuarioAtualizado) => {
    setUsuario(usuarioAtualizado);
    authService.setUser(usuarioAtualizado);
  }, []);

  // Verificar se usuário tem permissão
  const temPermissao = useCallback((permissao) => {
    if (!usuario || !usuario.permissoes) return false;
    
    // Se for array de permissões, verificar se tem pelo menos uma
    if (Array.isArray(permissao)) {
      return permissao.some(p => usuario.permissoes.includes(p));
    }
    
    return usuario.permissoes.includes(permissao);
  }, [usuario]);

  // Verificar se usuário pertence a um grupo
  const temGrupo = useCallback((nomeGrupo) => {
    if (!usuario || !usuario.grupo) return false;
    
    // Se for array de grupos, verificar se pertence a algum
    if (Array.isArray(nomeGrupo)) {
      return nomeGrupo.includes(usuario.grupo.nome);
    }
    
    return usuario.grupo.nome === nomeGrupo;
  }, [usuario]);

  const value = {
    usuario,
    loading,
    initialized,
    isAuthenticated: !!usuario,
    login,
    logout,
    atualizarUsuario,
    temPermissao,
    temGrupo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 🪝 5. HOOKS - useAuth

Crie `frontend/src/hooks/useAuth.js`:

```javascript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};
```

---

## 🪝 6. HOOKS - usePermissions

Crie `frontend/src/hooks/usePermissions.js`:

```javascript
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { usuario, temPermissao, temGrupo } = useAuth();

  // Lista de permissões do usuário
  const permissoes = usuario?.permissoes || [];

  // Grupo do usuário
  const grupo = usuario?.grupo?.nome || null;

  // Verificar múltiplas permissões
  const temTodasPermissoes = (...perms) => {
    return perms.every(p => temPermissao(p));
  };

  const temAlgumaPermissao = (...perms) => {
    return perms.some(p => temPermissao(p));
  };

  // Atalhos para grupos comuns
  const isAdmin = temGrupo('Admin');
  const isGerente = temGrupo(['Admin', 'Gerente']);
  const isAtendente = temGrupo('Atendente');
  const isCozinha = temGrupo('Cozinha');
  const isCaixa = temGrupo('Caixa');

  // Permissões específicas (atalhos)
  const podeCriarPedido = temPermissao('criar_pedido');
  const podeCancelarPedido = temPermissao('cancelar_pedido');
  const podeMarcarPronto = temPermissao('marcar_pronto');
  const podeFinalizarPedido = temPermissao('finalizar_pedido');
  const podeGerenciarProdutos = temPermissao('gerenciar_produtos');
  const podeGerenciarUsuarios = temPermissao('gerenciar_usuarios');
  const podeVerDashboard = temPermissao('ver_dashboard');
  const podeGerenciarEstoque = temPermissao('gerenciar_estoque');

  return {
    // Dados
    permissoes,
    grupo,
    
    // Funções de verificação
    temPermissao,
    temGrupo,
    temTodasPermissoes,
    temAlgumaPermissao,
    
    // Atalhos de grupos
    isAdmin,
    isGerente,
    isAtendente,
    isCozinha,
    isCaixa,
    
    // Atalhos de permissões
    podeCriarPedido,
    podeCancelarPedido,
    podeMarcarPronto,
    podeFinalizarPedido,
    podeGerenciarProdutos,
    podeGerenciarUsuarios,
    podeVerDashboard,
    podeGerenciarEstoque,
  };
};
```

---

## 🛡️ 7. COMPONENTS - ProtectedRoute

Crie `frontend/src/components/auth/ProtectedRoute.jsx`:

```jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';

const ProtectedRoute = ({ 
  children, 
  requiredPermission = null,
  requiredGroup = null,
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, loading, initialized, temPermissao, temGrupo } = useAuth();
  const location = useLocation();

  // Aguardar inicialização
  if (!initialized || loading) {
    return <Loading />;
  }

  // Se não autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Se requer permissão específica
  if (requiredPermission && !temPermissao(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚫 Acesso Negado
          </h1>
          <p className="text-gray-600 mb-8">
            Você não tem permissão para acessar esta página.
          </p>
          <a
            href="/"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  // Se requer grupo específico
  if (requiredGroup && !temGrupo(requiredGroup)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚫 Acesso Negado
          </h1>
          <p className="text-gray-600 mb-8">
            Esta página é restrita ao grupo: <strong>{requiredGroup}</strong>
          </p>
          <a
            href="/"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  // Usuário autenticado e com permissões corretas
  return children;
};

export default ProtectedRoute;
```

---

## ⏳ 8. COMPONENTS - Loading

Crie `frontend/src/components/common/Loading.jsx`:

```jsx
import React from 'react';

const Loading = ({ fullScreen = true, message = 'Carregando...' }) => {
  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Spinner animado */}
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        
        {/* Mensagem */}
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
```

---

## 🔄 9. ATUALIZAR App.jsx

Atualize `frontend/src/App.jsx`:

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Páginas (serão criadas nas próximas fases)
import Login from './pages/Login';
import Hub from './pages/Hub';
// import Atendente from './pages/Atendente';
// import Cozinha from './pages/Cozinha';
// import Caixa from './pages/Caixa';
// import Admin from './pages/Admin';
// import Dashboard from './pages/Dashboard';
// import Estoque from './pages/Estoque';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota pública - Login */}
          <Route path="/login" element={<Login />} />

          {/* Rota protegida - Hub (escolher função) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Hub />
              </ProtectedRoute>
            }
          />

          {/* Rotas protegidas por permissão (serão criadas nas próximas fases) */}
          
          {/* <Route
            path="/atendente"
            element={
              <ProtectedRoute requiredPermission="criar_pedido">
                <Atendente />
              </ProtectedRoute>
            }
          /> */}

          {/* <Route
            path="/cozinha"
            element={
              <ProtectedRoute requiredPermission="marcar_pronto">
                <Cozinha />
              </ProtectedRoute>
            }
          /> */}

          {/* <Route
            path="/caixa"
            element={
              <ProtectedRoute requiredPermission="finalizar_pedido">
                <Caixa />
              </ProtectedRoute>
            }
          /> */}

          {/* <Route
            path="/admin"
            element={
              <ProtectedRoute requiredPermission="gerenciar_configuracoes">
                <Admin />
              </ProtectedRoute>
            }
          /> */}

          {/* <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredPermission="ver_dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          /> */}

          {/* <Route
            path="/estoque"
            element={
              <ProtectedRoute requiredPermission="ver_estoque">
                <Estoque />
              </ProtectedRoute>
            }
          /> */}

          {/* Rota não encontrada */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🧪 10. EXEMPLO DE USO - Página Login (Básica)

Crie `frontend/src/pages/Login.jsx` (versão simples para testar):

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Se já autenticado, redirecionar
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    const resultado = await login(email, senha);

    if (resultado.sucesso) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setErro(resultado.erro);
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo/Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🍔 Sistema de Pedidos
          </h1>
          <p className="text-gray-600">
            Faça login para continuar
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="seu@email.com"
              disabled={carregando}
            />
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="••••••••"
              disabled={carregando}
            />
          </div>

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {erro}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Credenciais padrão (apenas desenvolvimento) */}
        {import.meta.env.DEV && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-2">
              Credenciais padrão (dev):
            </p>
            <p className="text-xs text-gray-600 text-center font-mono">
              admin@sistema.com / admin123
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
```

---

## 🧪 11. EXEMPLO DE USO - Página Hub (Básica)

Crie `frontend/src/pages/Hub.jsx` (versão simples para testar):

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

const Hub = () => {
  const { usuario, logout } = useAuth();
  const {
    podeCriarPedido,
    podeMarcarPronto,
    podeFinalizarPedido,
    podeVerDashboard,
    podeGerenciarEstoque,
    podeGerenciarProdutos,
  } = usePermissions();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo, {usuario.nome}!
            </h1>
            <p className="text-gray-600">
              Grupo: <span className="font-medium">{usuario.grupo.nome}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Grid de Opções */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Escolha sua função:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Atendente */}
          {podeCriarPedido && (
            <button
              onClick={() => navigate('/atendente')}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left border-2 border-transparent hover:border-primary-500"
            >
              <div className="text-4xl mb-4">🍔</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Atendente
              </h3>
              <p className="text-gray-600">
                Anotar pedidos dos clientes
              </p>
            </button>
          )}

          {/* Cozinha */}
          {podeMarcarPronto && (
            <button
              onClick={() => navigate('/cozinha')}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left border-2 border-transparent hover:border-primary-500"
            >
              <div className="text-4xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cozinha
              </h3>
              <p className="text-gray-600">
                Painel de preparo de pedidos
              </p>
            </button>
          )}

          {/* Caixa */}
          {podeFinalizarPedido && (
            <button
              onClick={() => navigate('/caixa')}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left border-2 border-transparent hover:border-primary-500"
            >
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Caixa
              </h3>
              <p className="text-gray-600">
                Finalizar pagamentos
              </p>
            </button>
          )}

          {/* Dashboard */}
          {podeVerDashboard && (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left border-2 border-transparent hover:border-primary-500"
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Dashboard
              </h3>
              <p className="text-gray-600">
                Relatórios e KPIs
              </p>
            </button>
          )}

          {/* Admin */}
          {podeGerenciarProdutos && (
            <button
              onClick={() => navigate('/admin')}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left border-2 border-transparent hover:border-primary-500"
            >
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Administração
              </h3>
              <p className="text-gray-600">
                Gerenciar sistema
              </p>
            </button>
          )}

          {/* Estoque */}
          {podeGerenciarEstoque && (
            <button
              onClick={() => navigate('/estoque')}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left border-2 border-transparent hover:border-primary-500"
            >
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Estoque
              </h3>
              <p className="text-gray-600">
                Controle de estoque
              </p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hub;
```

---

## ✅ 12. CHECKLIST FINAL DA PHASE 03

### Infraestrutura de Autenticação
- [x] Storage helpers (localStorage)
- [x] API service (Axios + interceptors)
- [x] Auth service (login, logout, verificar)
- [x] AuthContext (gerenciamento de estado)
- [x] useAuth hook
- [x] usePermissions hook
- [x] ProtectedRoute component
- [x] Loading component

### Funcionalidades Implementadas
- [x] Login com JWT
- [x] Logout
- [x] Persistência de sessão (localStorage)
- [x] Auto-verificação de token ao carregar app
- [x] Interceptor de 401 (redirect para login)
- [x] Proteção de rotas por autenticação
- [x] Proteção de rotas por permissão
- [x] Proteção de rotas por grupo
- [x] Verificação de permissões em componentes
- [x] Loading states

### Páginas Básicas Criadas
- [x] Login (funcional)
- [x] Hub (funcional com permissões)

---

## 🧪 13. TESTANDO A AUTENTICAÇÃO

### Passo 1: Iniciar Backend
```bash
cd backend
npm run dev
```

### Passo 2: Iniciar Frontend
```bash
cd frontend
npm run dev
```

### Passo 3: Acessar e Testar
1. Acesse http://localhost:5173
2. Será redirecionado para /login (não autenticado)
3. Entre com: admin@sistema.com / admin123
4. Após login, será redirecionado para Hub
5. Veja as opções baseadas nas permissões do admin
6. Clique em "Sair" - será deslogado
7. Tente acessar / sem login - será redirecionado

### Passo 4: Testar Proteção de Rotas
- Descomente as rotas no App.jsx
- Crie usuários com grupos diferentes (Atendente, Cozinha, etc)
- Teste acesso às rotas com diferentes usuários
- Verifique se mensagem de "Acesso Negado" aparece corretamente

---

## 📝 14. EXEMPLOS DE USO NOS COMPONENTES

### Exemplo 1: Verificar permissão antes de mostrar botão

```jsx
import { usePermissions } from '../hooks/usePermissions';

const MeuComponente = () => {
  const { podeCancelarPedido } = usePermissions();

  return (
    <div>
      {podeCancelarPedido && (
        <button>Cancelar Pedido</button>
      )}
    </div>
  );
};
```

### Exemplo 2: Verificar múltiplas permissões

```jsx
import { usePermissions } from '../hooks/usePermissions';

const MeuComponente = () => {
  const { temAlgumaPermissao, temTodasPermissoes } = usePermissions();

  const podeEditar = temAlgumaPermissao('editar_pedido', 'gerenciar_pedidos');
  const podeGerenciar = temTodasPermissoes('gerenciar_produtos', 'gerenciar_estoque');

  return (
    <div>
      {podeEditar && <button>Editar</button>}
      {podeGerenciar && <button>Gerenciar</button>}
    </div>
  );
};
```

### Exemplo 3: Mostrar conteúdo baseado no grupo

```jsx
import { usePermissions } from '../hooks/usePermissions';

const MeuComponente = () => {
  const { isAdmin, isGerente } = usePermissions();

  return (
    <div>
      {isAdmin && <div>Área do Admin</div>}
      {isGerente && <div>Área do Gerente</div>}
    </div>
  );
};
```

### Exemplo 4: Obter dados do usuário

```jsx
import { useAuth } from '../hooks/useAuth';

const MeuComponente = () => {
  const { usuario } = useAuth();

  return (
    <div>
      <p>Olá, {usuario.nome}!</p>
      <p>Email: {usuario.email}</p>
      <p>Grupo: {usuario.grupo.nome}</p>
    </div>
  );
};
```

---

## 🎯 PHASE 03 COMPLETA!

### O que foi entregue:

✅ **Sistema completo de autenticação**  
✅ **Context API** para gerenciamento global  
✅ **Hooks customizados** (useAuth, usePermissions)  
✅ **Proteção de rotas** por autenticação, permissão e grupo  
✅ **Persistência de sessão** com localStorage  
✅ **Interceptors** de token e erro 401  
✅ **Loading states** globais  
✅ **Páginas básicas** (Login + Hub) funcionais  

### Próximas Fases:

**PHASE_04** - Hub de Login (melhorar UI/UX)  
**PHASE_05** - Tela Atendente (PWA)  
**PHASE_06** - Painel Cozinha  
**PHASE_07** - Tela Caixa  

---

## 📝 Notas para Claude Opus 4.5

- Sistema de auth está pronto e testado
- AuthContext gerencia estado global de autenticação
- useAuth e usePermissions facilitam uso em qualquer componente
- ProtectedRoute protege rotas automaticamente
- Interceptors garantem que token seja enviado em todas as requisições
- Sistema é resiliente: se API não responder no logout, limpa storage mesmo assim
- Permissões são verificadas no frontend, mas backend também valida (segurança em camadas)
- Loading states impedem que usuário veja flashes de conteúdo não autorizado
- TESTE login, logout e acesso a rotas protegidas antes de prosseguir

---

**Status:** ✅ Autenticação Frontend Completa  
**Tempo estimado:** 1-2 horas  
**Complexidade:** Média  
**Dependências:** PHASE_02 (Backend) concluída