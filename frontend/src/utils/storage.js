/**
 * Utilitários para gerenciamento do localStorage
 */

const STORAGE_KEYS = {
  TOKEN: '@lanchonete:token',
  USER: '@lanchonete:user',
};

// ============ TOKEN ============

export const setToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } catch (error) {
    console.error('Erro ao salvar token:', error);
  }
};

export const getToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Erro ao recuperar token:', error);
    return null;
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Erro ao remover token:', error);
  }
};

// ============ USER ============

export const setUser = (user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
  }
};

export const getUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    if (!user || user === 'undefined' || user === 'null') {
      return null;
    }
    return JSON.parse(user);
  } catch (error) {
    console.error('Erro ao recuperar usuário:', error);
    return null;
  }
};

export const removeUser = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
  }
};

// ============ CLEAR ALL ============

export const clearStorage = () => {
  removeToken();
  removeUser();
};
