export function ProdutoCard({ produto, onAdd }) {
  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  };

  return (
    <div
      onClick={() => onAdd(produto)}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
      {/* Imagem */}
      <div className="h-32 bg-gray-200 flex items-center justify-center">
        {produto.imagem ? (
          <img
            src={produto.imagem}
            alt={produto.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl">🍔</span>
        )}
      </div>

      {/* Informações */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
          {produto.nome}
        </h3>
        {produto.descricao && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {produto.descricao}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary-600">
            {formatarPreco(produto.preco)}
          </span>
          {!produto.disponivel && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
              Indisponível
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
