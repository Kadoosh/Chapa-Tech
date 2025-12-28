/**
 * Constantes de permissões do sistema
 * Espelha as permissões definidas no backend em middleware/permissions.js
 */
export const PERMISSIONS = {
    // Pedidos
    VER_PEDIDOS: 'ver_pedidos',
    CRIAR_PEDIDO: 'criar_pedido',
    EDITAR_PEDIDO: 'editar_pedido',
    CANCELAR_PEDIDO: 'cancelar_pedido',
    FINALIZAR_PEDIDO: 'finalizar_pedido',
    MARCAR_PRONTO: 'marcar_pronto',

    // Usuários
    GERENCIAR_USUARIOS: 'gerenciar_usuarios',

    // Estoque
    GERENCIAR_ESTOQUE: 'gerenciar_estoque',

    // Produtos/Categorias
    GERENCIAR_CARDAPIO: 'gerenciar_cardapio',

    // Dashboard
    VER_DASHBOARD: 'ver_dashboard',

    // Backup
    FAZER_BACKUP: 'fazer_backup',
};

/**
 * Mapeamento de rotas para permissões necessárias
 */
export const ROUTE_PERMISSIONS = {
    '/atendente': PERMISSIONS.CRIAR_PEDIDO,
    '/cozinha': PERMISSIONS.VER_PEDIDOS,
    '/caixa': PERMISSIONS.FINALIZAR_PEDIDO,
    '/admin': PERMISSIONS.GERENCIAR_USUARIOS,
    '/dashboard': PERMISSIONS.GERENCIAR_USUARIOS,
    '/estoque': PERMISSIONS.GERENCIAR_ESTOQUE,
    '/configuracoes': PERMISSIONS.GERENCIAR_USUARIOS,
    '/catalogo': PERMISSIONS.GERENCIAR_USUARIOS,
};

export default PERMISSIONS;
