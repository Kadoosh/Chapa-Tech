import { ProdutoCard } from './ProdutoCard';

export function ProdutoList({ produtos, isLoading, onAddProduto, busca }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (!produtos || produtos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <p className="text-xl mb-2">📦</p>
          <p>
            {busca
              ? 'Nenhum produto encontrado'
              : 'Nenhum produto disponível'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 pb-4">
      {produtos.map((produto) => (
        <ProdutoCard
          key={produto.id}
          produto={produto}
          onAdd={onAddProduto}
        />
      ))}
    </div>
  );
}
