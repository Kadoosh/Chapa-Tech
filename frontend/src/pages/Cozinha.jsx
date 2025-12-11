import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { usePedidos, useAtualizarStatusPedido } from '../hooks/usePedidos';
import { FiltroPedidos } from '../components/cozinha/FiltroPedidos';
import { ColunaKanban } from '../components/cozinha/ColunaKanban';
import { FeedbackModal } from '../components/common/FeedbackModal';
import { HiddenHeader } from '../components/common/HiddenHeader';
import { playNotificationSound, playSuccessSound } from '../utils/sounds';

export function Cozinha() {
  const { user } = useAuth();
  const [filtro, setFiltro] = useState('preparando');
  const [feedback, setFeedback] = useState({ open: false, type: 'success', title: '', message: '' });

  // Query de pedidos
  const { data: pedidosData, refetch } = usePedidos({
    status: filtro === 'todos' ? undefined : filtro,
  });

  const atualizarStatus = useAtualizarStatusPedido();

  // Derivar pedidos diretamente da query
  const pedidos = useMemo(() => pedidosData?.data || [], [pedidosData]);

  // Handlers WebSocket - refetch ao receber atualizações
  const handleNovoPedido = useCallback(() => {
    console.log('🔔 Novo pedido recebido');
    playNotificationSound();
    refetch();
  }, [refetch]);

  const handlePedidoAtualizado = useCallback(() => {
    console.log('🔄 Pedido atualizado');
    refetch();
  }, [refetch]);

  const handlePedidoCancelado = useCallback(() => {
    console.log('❌ Pedido cancelado');
    refetch();
  }, [refetch]);

  // Conectar WebSocket
  useSocket({
    'pedido:novo': handleNovoPedido,
    'pedido:atualizado': handlePedidoAtualizado,
    'pedido:cancelado': handlePedidoCancelado,
  });

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Marcar pedido como pronto
  const handleMarcarPronto = async (pedidoId) => {
    try {
      await atualizarStatus.mutateAsync({
        id: pedidoId,
        status: 'pronto',
      });
      playSuccessSound();
    } catch (error) {
      setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
    }
  };

  // Filtrar pedidos
  const pedidosPreparando = pedidos.filter((p) => p.status === 'preparando');
  const pedidosProntos = pedidos.filter((p) => p.status === 'pronto');

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Hidden Header */}
      <HiddenHeader />

      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🍳 Cozinha</h1>
            <p className="text-sm opacity-90">Olá, {user?.nome}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{pedidos.length}</p>
            <p className="text-sm opacity-90">Pedidos Ativos</p>
          </div>
        </div>

        <div className="mt-4">
          <FiltroPedidos filtroAtivo={filtro} onChangeFiltro={setFiltro} />
        </div>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden p-4">
        {filtro === 'todos' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            <ColunaKanban
              titulo="🔥 Preparando"
              pedidos={pedidosPreparando}
              onMarcarPronto={handleMarcarPronto}
              cor="yellow"
            />
            <ColunaKanban
              titulo="✅ Prontos"
              pedidos={pedidosProntos}
              onMarcarPronto={handleMarcarPronto}
              cor="green"
            />
          </div>
        ) : (
          <div className="h-full">
            <ColunaKanban
              titulo={filtro === 'preparando' ? '🔥 Preparando' : '✅ Prontos'}
              pedidos={filtro === 'preparando' ? pedidosPreparando : pedidosProntos}
              onMarcarPronto={handleMarcarPronto}
              cor={filtro === 'preparando' ? 'yellow' : 'green'}
            />
          </div>
        )}
      </div>

      {/* Modal de Feedback */}
      <FeedbackModal
        isOpen={feedback.open}
        onClose={() => setFeedback({ ...feedback, open: false })}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
      />
    </div>
  );
}
