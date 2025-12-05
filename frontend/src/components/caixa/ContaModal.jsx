import { useState } from 'react';
import { Modal } from '../common/Modal';
import { PedidoResumo } from './PedidoResumo';
import { usePedidosPorMesa, useMarcarComoPago } from '../../hooks/usePedidosPorMesa';

export function ContaModal({ isOpen, onClose, mesa }) {
  const [desconto, setDesconto] = useState(0);
  const { data: pedidosData, isLoading } = usePedidosPorMesa(mesa?.id, isOpen);
  const marcarComoPago = useMarcarComoPago();

  const pedidos = pedidosData?.data || [];

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  };

  // Calcular totais
  const subtotal = pedidos.reduce((acc, pedido) => acc + (pedido.total || 0), 0);
  const valorDesconto = (subtotal * desconto) / 100;
  const total = subtotal - valorDesconto;

  const handleFinalizarPagamento = async () => {
    if (!window.confirm(`Confirmar pagamento de ${formatarPreco(total)}?`)) {
      return;
    }

    try {
      // Marcar todos os pedidos como pagos
      for (const pedido of pedidos) {
        await marcarComoPago.mutateAsync(pedido.id);
      }

      alert('✅ Pagamento registrado com sucesso!');
      onClose();
    } catch (error) {
      alert('Erro ao registrar pagamento: ' + (error.response?.data?.message || error.message));
    }
  };

  if (!mesa) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Conta - Mesa ${mesa.numero}`} size="lg">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Carregando pedidos...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Informações da mesa */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-primary-900">Mesa {mesa.numero}</h3>
                <p className="text-sm text-primary-700">
                  {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
                </p>
              </div>
              <span className="text-3xl">🧾</span>
            </div>
          </div>

          {/* Lista de pedidos */}
          {pedidos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-xl mb-2">📭</p>
              <p>Nenhum pedido ativo para esta mesa</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pedidos.map((pedido) => (
                <PedidoResumo key={pedido.id} pedido={pedido} />
              ))}
            </div>
          )}

          {/* Desconto */}
          {pedidos.length > 0 && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desconto (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={desconto}
                onChange={(e) => setDesconto(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          )}

          {/* Totais */}
          {pedidos.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatarPreco(subtotal)}</span>
              </div>
              {desconto > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Desconto ({desconto}%):</span>
                  <span className="font-semibold">- {formatarPreco(valorDesconto)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                <span>Total:</span>
                <span className="text-primary-600">{formatarPreco(total)}</span>
              </div>
            </div>
          )}

          {/* Ações */}
          {pedidos.length > 0 && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalizarPagamento}
                disabled={marcarComoPago.isPending}
                className="flex-1 px-4 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 font-semibold transition-colors disabled:opacity-50"
              >
                {marcarComoPago.isPending ? 'Processando...' : '💰 Finalizar Pagamento'}
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
