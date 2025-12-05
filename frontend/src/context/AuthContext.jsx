import { createContext, useState } from 'react';
import api from '../services/api';
import { setToken, setUser, getUser, clearStorage } from '../utils/storage';

const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => getUser());
  const [loading, _setLoading] = useState(false);

  // Login
  const login = async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { login: email, senha });
      
      // Backend retorna: { success, message, data: { usuario, token } }
      const { token, usuario } = response.data.data;
      
      // Normaliza permissões para facilitar acesso
      const usuarioNormalizado = {
        ...usuario,
        permissoes: usuario.grupo?.permissoes || [],
      };

      // Salva no localStorage
      setToken(token);
      setUser(usuarioNormalizado);

      // Atualiza o estado
      setUserState(usuarioNormalizado);

      return { success: true, usuario: usuarioNormalizado };
    } catch (error) {
      console.error('Erro no login:', error);
      const mensagem = error.response?.data?.mensagem || error.response?.data?.message || 'Erro ao fazer login';
      return { success: false, mensagem };
    }
  };

  // Logout
  const logout = () => {
    clearStorage();
    setUserState(null);
    window.location.href = '/login';
  };

  // Verifica se o usuário tem uma permissão específica
  const hasPermission = (chave) => {
    if (!user || !user.permissoes) return false;
    return user.permissoes.some((p) => p.chave === chave);
  };

  // Verifica se o usuário pertence a um grupo
  const hasGroup = (nomeGrupo) => {
    if (!user || !user.grupo) return false;
    return user.grupo.nome === nomeGrupo;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    hasGroup,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
