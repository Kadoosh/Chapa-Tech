import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Hub() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  // Cards públicos (sem necessidade de permissão)
  const publicCards = [
    {
      title: 'Auto Atendimento',
      description: 'Totem/Tablet para clientes',
      icon: '📱',
      path: '/autoatendimento',
      bgColor: 'bg-teal-500',
      hoverColor: 'hover:bg-teal-600',
      permission: null, // Sem permissão necessária
    },
  ];

  // Cards de acesso rápido baseados em permissões
  const cards = [
    {
      title: 'Atendente',
      description: 'Gerenciar pedidos e atendimento',
      icon: '👨‍💼',
      path: '/atendente',
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      permission: 'criar_pedido',
    },
    {
      title: 'Cozinha',
      description: 'Visualizar pedidos em preparo',
      icon: '👨‍🍳',
      path: '/cozinha',
      bgColor: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      permission: 'ver_pedidos',
    },
    {
      title: 'Caixa',
      description: 'Gerenciar pagamentos',
      icon: '💰',
      path: '/caixa',
      bgColor: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      permission: 'finalizar_pedido',
    },
    {
      title: 'Dashboard',
      description: 'KPIs e métricas do negócio',
      icon: '📊',
      path: '/dashboard',
      bgColor: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      permission: 'gerenciar_usuarios',
    },
    {
      title: 'Estoque',
      description: 'Controle de estoque e movimentações',
      icon: '📦',
      path: '/estoque',
      bgColor: 'bg-amber-500',
      hoverColor: 'hover:bg-amber-600',
      permission: 'gerenciar_estoque',
    },
    {
      title: 'Configurações',
      description: 'Impressora e backups',
      icon: '🔧',
      path: '/configuracoes',
      bgColor: 'bg-slate-500',
      hoverColor: 'hover:bg-slate-600',
      permission: 'gerenciar_usuarios',
    },
    {
      title: 'Catálogo de Produtos',
      description: 'Produtos, categorias e acompanhamentos',
      icon: '📋',
      path: '/catalogo',
      bgColor: 'bg-rose-500',
      hoverColor: 'hover:bg-rose-600',
      permission: 'gerenciar_usuarios',
    },
    {
      title: 'Administração',
      description: 'Mesas e usuários',
      icon: '⚙️',
      path: '/admin',
      bgColor: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      permission: 'gerenciar_usuarios',
    },
  ];

  // Filtra cards baseado nas permissões do usuário
  const availableCards = cards.filter((card) => {
    return hasPermission(card.permission);
  });

  // Combina cards públicos com cards permitidos
  const allAvailableCards = [...publicCards, ...availableCards];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🍔</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sistema Lanchonete</h1>
                <p className="text-sm text-gray-600">
                  Bem-vindo, <span className="font-medium">{user?.nome}</span>!
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Selecione uma opção
          </h2>
          <p className="text-gray-600">
            Escolha a área que deseja acessar
          </p>
        </div>

        {/* Cards Grid */}
        {allAvailableCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allAvailableCards.map((card) => (
              <button
                key={card.path}
                onClick={() => navigate(card.path)}
                className={`${card.bgColor} ${card.hoverColor} text-white rounded-xl shadow-lg p-8 transition-all transform hover:scale-105 hover:shadow-xl`}
              >
                <div className="text-6xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-sm opacity-90">{card.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-yellow-800 mb-2">
              Sem permissões
            </h3>
            <p className="text-yellow-700">
              Você não tem permissão para acessar nenhuma área do sistema.
              Entre em contato com o administrador.
            </p>
          </div>
        )}


      </main>
    </div>
  );
}
