import { CarrinhoItem } from './CarrinhoItem';

export function Carrinho({
  itens,
  onUpdateQuantidade,
  onRemove,
  onUpdateObservacao,
  onFinalizarPedido,
  isLoading,
  observacaoGeral,
  onUpdateObservacaoGeral,
}) {
  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  };

  const total = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  const quantidadeTotal = itens.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4">
        <h2 className="text-lg font-bold">Carrinho</h2>
        <p className="text-sm opacity-90">
          {quantidadeTotal} {quantidadeTotal === 1 ? 'item' : 'itens'}
        </p>
      </div>

      {/* Itens */}
      <div className="flex-1 overflow-y-auto">
        {itens.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-5xl mb-2">🛒</span>
            <p>Carrinho vazio</p>
          </div>
        ) : (
          itens.map((item) => (
            <CarrinhoItem
              key={item.id}
              item={item}
              onUpdateQuantidade={onUpdateQuantidade}
              onRemove={onRemove}
              onUpdateObservacao={onUpdateObservacao}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {itens.length > 0 && (
        <div className="border-t bg-white p-4 space-y-3">
          {/* Observação Geral */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observação do Pedido
            </label>
            <textarea
              value={observacaoGeral || ''}
              onChange={(e) => onUpdateObservacaoGeral(e.target.value)}
              placeholder="Ex: Sem cebola, bem passado..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-primary-600">
              {formatarPreco(total)}
            </span>
          </div>
          <button
            onClick={onFinalizarPedido}
            disabled={isLoading}
            className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Enviando...' : 'Enviar Pedido'}
          </button>
        </div>
      )}
    </div>
  );
}
