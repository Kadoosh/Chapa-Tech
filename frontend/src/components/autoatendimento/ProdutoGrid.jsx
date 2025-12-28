import { ProdutoCard } from './ProdutoCard';

/**
 * Grid de produtos de uma categoria
 */
export function ProdutoGrid({
    produtos,
    categorias,
    categoriaAtiva,
    carrinho,
    onClickProduto,
    onAdicionar,
    onRemover
}) {
    const categoriaNome = categorias.find(c => c.id === categoriaAtiva)?.nome;

    return (
        <main className="flex-1 overflow-y-auto">
            <div className="p-6">
                {/* Header da categoria ativa */}
                {categoriaAtiva && (
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">
                            {categoriaNome}
                        </h2>
                        <p className="text-gray-500 mt-1">
                            {produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'}
                        </p>
                    </div>
                )}

                {/* Grid de Produtos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {produtos.map(produto => {
                        const itemCarrinho = carrinho.find(item => item.id === produto.id);
                        return (
                            <ProdutoCard
                                key={produto.id}
                                produto={produto}
                                quantidadeNoCarrinho={itemCarrinho?.quantidade || 0}
                                onClickProduto={onClickProduto}
                                onAdicionar={onAdicionar}
                                onRemover={onRemover}
                            />
                        );
                    })}
                </div>

                {/* Mensagem quando não há produtos */}
                {produtos.length === 0 && categoriaAtiva && (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-4">🍽️</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            Nenhum produto disponível
                        </h3>
                        <p className="text-gray-500">
                            Não há produtos nesta categoria no momento
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
