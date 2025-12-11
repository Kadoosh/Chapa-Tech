import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useMesasComPedidos } from '../hooks/usePedidosPorMesa';
import { MesaCard } from '../components/caixa/MesaCard';
import { ContaModal } from '../components/caixa/ContaModal';
import { HiddenHeader } from '../components/common/HiddenHeader';

export function Caixa() {
  const { user } = useAuth();
  const [busca, setBusca] = useState('');
  const [mesaSelecionada, setMesaSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  // Query de mesas
  const { data: mesasData, refetch } = useMesasComPedidos();

  // Derivar mesas diretamente dos dados da query (sem estado local)
  const mesas = useMemo(() => mesasData?.data || [], [mesasData]);

  // Handlers WebSocket
  const handlePedidoNovo = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePedidoAtualizado = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleMesaAtualizada = useCallback(() => {
    refetch();
  }, [refetch]);

  // Conectar WebSocket
  useSocket({
    'pedido:novo': handlePedidoNovo,
    'pedido:atualizado': handlePedidoAtualizado,
    'mesa:atualizada': handleMesaAtualizada,
  });

  // Auto-refresh a cada 20 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 20000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Abrir modal da mesa
  const handleAbrirMesa = (mesa) => {
    setMesaSelecionada(mesa);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setMesaSelecionada(null);
    refetch();
  };

  // Filtrar mesas pela busca
  const mesasFiltradas = mesas.filter((mesa) => {
    if (!busca) return true;
    return mesa.numero.toString().includes(busca);
  });

  // Calcular total gasto por mesa (mock - será calculado pelo backend)
  const calcularTotalMesa = (mesa) => {
    // TODO: Implementar cálculo real quando tiver endpoint específico
    return mesa.totalGasto || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden Header */}
      <HiddenHeader />

      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">💰 Caixa</h1>
              <p className="text-sm opacity-90 mt-1">Olá, {user?.nome}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{mesas.length}</p>
              <p className="text-sm opacity-90">Mesas Ocupadas</p>
            </div>
          </div>

          {/* Busca */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Buscar mesa por número..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto p-6">
        {mesasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-8xl mb-4">💤</span>
            <h2 className="text-2xl font-semibold mb-2">
              {busca ? 'Nenhuma mesa encontrada' : 'Nenhuma mesa ocupada'}
            </h2>
            <p className="text-gray-500">
              {busca ? 'Tente buscar por outro número' : 'Aguardando novos pedidos...'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mesasFiltradas.map((mesa) => (
              <MesaCard
                key={mesa.id}
                mesa={mesa}
                totalGasto={calcularTotalMesa(mesa)}
                onClick={() => handleAbrirMesa(mesa)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de Conta */}
      <ContaModal
        isOpen={modalAberto}
        onClose={handleFecharModal}
        mesa={mesaSelecionada}
      />
    </div>
  );
}
