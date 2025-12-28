import { formatarPreco } from '../../utils/formatters';

/**
 * Card individual de produto
 */
export function ProdutoCard({
    produto,
    quantidadeNoCarrinho,
    onClickProduto,
    onAdicionar,
    onRemover
}) {
    // Parsear imagens do produto
    const getImagem = () => {
        try {
            const imagens = produto.imagens ? JSON.parse(produto.imagens) : [];
            if (imagens.length > 0) {
                return imagens[0];
            }
        } catch (e) {
            console.error('Erro ao parsear imagens:', e);
        }
        return null;
    };

    const imagem = getImagem();

    return (
        <div
            className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow cursor-pointer group"
            onClick={() => onClickProduto(produto)}
        >
            {/* Imagem do produto */}
            <div className="h-40 relative overflow-hidden">
                {imagem ? (
                    <img
                        src={imagem}
                        alt={produto.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <span className="text-6xl group-hover:scale-110 transition-transform">🍔</span>
                    </div>
                )}
                {quantidadeNoCarrinho > 0 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        {quantidadeNoCarrinho}
                    </div>
                )}
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-orange-500 transition-colors">
                    {produto.nome}
                </h3>
                {produto.descricao && (
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                        {produto.descricao}
                    </p>
                )}
                <p className="text-orange-500 font-bold text-2xl mt-auto">
                    {formatarPreco(produto.preco)}
                </p>
            </div>

            <div className="p-4 pt-0" onClick={(e) => e.stopPropagation()}>
                {quantidadeNoCarrinho > 0 ? (
                    <div className="flex items-center justify-between bg-orange-100 rounded-xl p-3">
                        <button
                            onClick={() => onRemover(produto.id)}
                            className="w-10 h-10 bg-orange-500 text-white rounded-full text-xl font-bold hover:bg-orange-600 transition-colors"
                        >
                            -
                        </button>
                        <span className="text-2xl font-bold text-orange-600">
                            {quantidadeNoCarrinho}
                        </span>
                        <button
                            onClick={() => onAdicionar(produto)}
                            className="w-10 h-10 bg-orange-500 text-white rounded-full text-xl font-bold hover:bg-orange-600 transition-colors"
                        >
                            +
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => onAdicionar(produto)}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
                    >
                        Adicionar
                    </button>
                )}
            </div>
        </div>
    );
}
