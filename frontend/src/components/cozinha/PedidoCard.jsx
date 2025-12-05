import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PedidoCard({ pedido, onMarcarPronto }) {
  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  };

  const tempoDecorrido = formatDistanceToNow(new Date(pedido.criadoEm), {
    locale: ptBR,
    addSuffix: true,
  });

  const getCorStatus = () => {
    if (pedido.status === 'pronto') return 'bg-green-100 border-green-400';
    if (pedido.status === 'preparando') return 'bg-yellow-100 border-yellow-400';
    return 'bg-gray-100 border-gray-300';
  };

  return (
    <div className={`border-2 rounded-lg p-4 shadow-md ${getCorStatus()} transition-all hover:shadow-lg`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Mesa {pedido.mesa?.numero || '---'}
          </h3>
          <p className="text-sm text-gray-600">Pedido #{pedido.id}</p>
          <p className="text-xs text-gray-500 mt-1">{tempoDecorrido}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            pedido.status === 'pronto'
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 text-white'
          }`}
        >
          {pedido.status === 'pronto' ? '✅ Pronto' : '🔥 Preparando'}
        </span>
      </div>

      {/* Itens */}
      <div className="space-y-2 mb-4">
        {pedido.itens?.map((item, index) => (
          <div key={index} className="bg-white rounded p-2 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {item.quantidade}x {item.produto?.nome || 'Item'}
                </p>
                {item.observacao && (
                  <p className="text-sm text-gray-600 mt-1 italic">
                    📝 {item.observacao}
                  </p>
                )}
              </div>
              <span className="text-sm text-gray-600">
                {formatarPreco(item.precoUnitario)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Observação do pedido */}
      {pedido.observacao && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Obs:</strong> {pedido.observacao}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="text-sm text-gray-600">
          {pedido.cliente && (
            <p>
              👤 {pedido.cliente.nome} {pedido.cliente.sobrenome}
            </p>
          )}
        </div>
        {pedido.status === 'preparando' && (
          <button
            onClick={() => onMarcarPronto(pedido.id)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
          >
            ✅ Marcar Pronto
          </button>
        )}
      </div>

      {/* Total */}
      <div className="mt-3 pt-3 border-t">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700">Total:</span>
          <span className="text-xl font-bold text-gray-900">
            {formatarPreco(pedido.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
