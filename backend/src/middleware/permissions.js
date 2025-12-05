import { AppError } from './errorHandler.js';

/**
 * Middleware de verificação de permissões
 * @param {string|string[]} permissoesRequeridas - Permissão(ões) necessária(s)
 * @returns {Function} Middleware
 */
export const requirePermissions = (permissoesRequeridas) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const permissoesArray = Array.isArray(permissoesRequeridas)
      ? permissoesRequeridas
      : [permissoesRequeridas];

    const usuarioPermissoes = req.user.permissoes || [];

    // Verifica se o usuário tem TODAS as permissões requeridas
    const temPermissao = permissoesArray.every((permissao) =>
      usuarioPermissoes.includes(permissao)
    );

    if (!temPermissao) {
      throw new AppError('Permissão negada', 403, {
        permissoesRequeridas: permissoesArray,
        permissoesUsuario: usuarioPermissoes,
      });
    }

    next();
  };
};

/**
 * Middleware de verificação de permissões (OR)
 * Usuário precisa ter PELO MENOS UMA das permissões
 * @param {string[]} permissoesRequeridas - Lista de permissões
 * @returns {Function} Middleware
 */
export const requireAnyPermission = (permissoesRequeridas) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const permissoesArray = Array.isArray(permissoesRequeridas)
      ? permissoesRequeridas
      : [permissoesRequeridas];

    const usuarioPermissoes = req.user.permissoes || [];

    // Verifica se o usuário tem PELO MENOS UMA das permissões requeridas
    const temPermissao = permissoesArray.some((permissao) =>
      usuarioPermissoes.includes(permissao)
    );

    if (!temPermissao) {
      throw new AppError('Permissão negada', 403, {
        permissoesRequeridas: permissoesArray,
        permissoesUsuario: usuarioPermissoes,
      });
    }

    next();
  };
};

/**
 * Middleware de verificação de grupo
 * @param {string|string[]} gruposPermitidos - Grupo(s) permitido(s)
 * @returns {Function} Middleware
 */
export const requireGroup = (gruposPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const gruposArray = Array.isArray(gruposPermitidos)
      ? gruposPermitidos
      : [gruposPermitidos];

    const usuarioGrupo = req.user.grupo?.nome;

    if (!usuarioGrupo || !gruposArray.includes(usuarioGrupo)) {
      throw new AppError('Acesso negado para este grupo', 403, {
        gruposPermitidos: gruposArray,
        grupoUsuario: usuarioGrupo,
      });
    }

    next();
  };
};

/**
 * Middleware que verifica se o usuário é admin
 * @returns {Function} Middleware
 */
export const requireAdmin = () => {
  return requireGroup('Admin');
};

/**
 * Middleware que verifica se o usuário pode acessar apenas seus próprios dados
 * @param {string} paramName - Nome do parâmetro que contém o ID do usuário
 * @returns {Function} Middleware
 */
export const requireSelfOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    const targetId = parseInt(req.params[paramName]);
    const isAdmin = req.user.grupo?.nome === 'Admin';
    const isSelf = req.user.id === targetId;

    if (!isSelf && !isAdmin) {
      throw new AppError('Você só pode acessar seus próprios dados', 403);
    }

    next();
  };
};

/**
 * Verifica se o usuário tem uma permissão específica
 * Função auxiliar que pode ser usada dentro de controllers
 * @param {Object} usuario - Objeto do usuário (req.user)
 * @param {string|string[]} permissoes - Permissão(ões) a verificar
 * @returns {boolean}
 */
export const hasPermission = (usuario, permissoes) => {
  if (!usuario || !usuario.permissoes) {
    return false;
  }

  const permissoesArray = Array.isArray(permissoes) ? permissoes : [permissoes];
  const usuarioPermissoes = usuario.permissoes || [];

  return permissoesArray.every((permissao) =>
    usuarioPermissoes.includes(permissao)
  );
};

/**
 * Verifica se o usuário tem pelo menos uma das permissões
 * @param {Object} usuario - Objeto do usuário (req.user)
 * @param {string[]} permissoes - Lista de permissões
 * @returns {boolean}
 */
export const hasAnyPermission = (usuario, permissoes) => {
  if (!usuario || !usuario.permissoes) {
    return false;
  }

  const permissoesArray = Array.isArray(permissoes) ? permissoes : [permissoes];
  const usuarioPermissoes = usuario.permissoes || [];

  return permissoesArray.some((permissao) =>
    usuarioPermissoes.includes(permissao)
  );
};

/**
 * Lista de permissões do sistema (para referência)
 */
export const PERMISSIONS = {
  // Pedidos
  CRIAR_PEDIDO: 'criar_pedido',
  EDITAR_PEDIDO: 'editar_pedido',
  CANCELAR_PEDIDO: 'cancelar_pedido',
  VER_PEDIDOS: 'ver_pedidos',
  MARCAR_PRONTO: 'marcar_pronto',
  FINALIZAR_PEDIDO: 'finalizar_pedido',

  // Produtos
  GERENCIAR_PRODUTOS: 'gerenciar_produtos',
  VER_PRODUTOS: 'ver_produtos',

  // Clientes
  GERENCIAR_CLIENTES: 'gerenciar_clientes',
  VER_CLIENTES: 'ver_clientes',

  // Usuários
  GERENCIAR_USUARIOS: 'gerenciar_usuarios',
  VER_USUARIOS: 'ver_usuarios',

  // Dashboard
  VER_DASHBOARD: 'ver_dashboard',
  VER_RELATORIOS: 'ver_relatorios',

  // Estoque
  GERENCIAR_ESTOQUE: 'gerenciar_estoque',
  VER_ESTOQUE: 'ver_estoque',

  // Configurações
  GERENCIAR_CONFIGURACOES: 'gerenciar_configuracoes',

  // Mesas
  GERENCIAR_MESAS: 'gerenciar_mesas',
};
