export function PedidoResumo({ pedido }) {
  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = () => {
    switch (pedido.status) {
      case 'preparando':
        return 'bg-yellow-100 text-yellow-700';
      case 'pronto':
        return 'bg-green-100 text-green-700';
      case 'entregue':
        return 'bg-blue-100 text-blue-700';
      case 'pago':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      {/* Header do pedido */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">Pedido #{pedido.id}</h4>
          <p className="text-xs text-gray-500">{formatarData(pedido.criadoEm)}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor()}`}>
          {pedido.status}
        </span>
      </div>

      {/* Itens do pedido */}
      <div className="space-y-2 mb-3">
        {pedido.itens?.map((item, index) => (
          <div key={index} className="flex items-start justify-between text-sm">
            <div className="flex-1">
              <p className="text-gray-900">
                <span className="font-medium">{item.quantidade}x</span>{' '}
                {item.produto?.nome || 'Item'}
              </p>
              {item.observacao && (
                <p className="text-xs text-gray-500 italic mt-1">
                  {item.observacao}
                </p>
              )}
            </div>
            <span className="text-gray-700 font-medium ml-2">
              {formatarPreco(item.precoUnitario * item.quantidade)}
            </span>
          </div>
        ))}
      </div>

      {/* Total do pedido */}
      <div className="border-t pt-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Subtotal:</span>
        <span className="text-lg font-bold text-gray-900">
          {formatarPreco(pedido.total)}
        </span>
      </div>
    </div>
  );
}
