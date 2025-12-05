import { PedidoCard } from './PedidoCard';

export function ColunaKanban({ titulo, pedidos, onMarcarPronto, cor = 'primary' }) {
  const getCorHeader = () => {
    if (cor === 'green') return 'bg-green-600';
    if (cor === 'yellow') return 'bg-yellow-600';
    return 'bg-primary-600';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-lg">
      {/* Header */}
      <div className={`${getCorHeader()} text-white p-4 rounded-t-lg`}>
        <h2 className="text-xl font-bold">{titulo}</h2>
        <p className="text-sm opacity-90">
          {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
        </p>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-6xl mb-2">📭</span>
            <p>Nenhum pedido</p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onMarcarPronto={onMarcarPronto}
            />
          ))
        )}
      </div>
    </div>
  );
}
