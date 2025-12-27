export function CarrinhoItem({ item, onUpdateQuantidade, onRemove, onUpdateObservacao }) {
  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  };

  const subtotal = item.preco * item.quantidade;
  const hasAcompanhamentos = item.acompanhamentos && item.acompanhamentos.length > 0;

  return (
    <div className="bg-white border-b last:border-b-0 p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{item.nome}</h4>
          {hasAcompanhamentos && (
            <div className="mt-1 space-y-0.5">
              {item.acompanhamentos.map((acomp) => (
                <div key={acomp.id} className="flex items-center gap-1 text-xs">
                  <span className="text-secondary-600">+ {acomp.nome}</span>
                  <span className="text-gray-400">({formatarPreco(acomp.valor)})</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-600 mt-1">
            {formatarPreco(item.preco)}
            {hasAcompanhamentos && ` (base: ${formatarPreco(item.precoBase)})`}
          </p>
        </div>
        <button
          onClick={() => onRemove(item.itemId)}
          className="text-red-500 hover:text-red-700 ml-2"
        >
          <span className="text-xl">×</span>
        </button>
      </div>

      {/* Controles de quantidade */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => onUpdateQuantidade(item.itemId, Math.max(1, item.quantidade - 1))}
          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          −
        </button>
        <span className="w-12 text-center font-medium">{item.quantidade}</span>
        <button
          onClick={() => onUpdateQuantidade(item.itemId, item.quantidade + 1)}
          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          +
        </button>
        <span className="ml-auto font-semibold text-primary-600">
          {formatarPreco(subtotal)}
        </span>
      </div>

      {/* Observações */}
      <textarea
        placeholder="Observações..."
        value={item.observacao || ''}
        onChange={(e) => onUpdateObservacao(item.itemId, e.target.value)}
        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        rows="2"
      />
    </div>
  );
}

