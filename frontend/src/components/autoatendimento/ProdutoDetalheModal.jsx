import { useState, useEffect } from 'react';
import { formatarPreco } from '../../utils/formatters';

/**
 * Modal com detalhes do produto selecionado
 * Inclui carousel de imagens, descrição, ingredientes e controles
 */
export function ProdutoDetalheModal({
    produto,
    carrinho,
    onFechar,
    onAdicionar,
    onRemover
}) {
    const [imagemAtiva, setImagemAtiva] = useState(0);

    // Resetar imagem ao trocar produto
    useEffect(() => {
        setImagemAtiva(0);
    }, [produto?.id]);

    if (!produto) return null;

    // Parsear imagens
    let imagens = [];
    try {
        imagens = produto.imagens ? JSON.parse(produto.imagens) : [];
    } catch (e) {
        console.error('Erro ao parsear imagens:', e);
    }

    const itemCarrinho = carrinho.find(item => item.id === produto.id);
    const quantidadeNoCarrinho = itemCarrinho?.quantidade || 0;

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={onFechar}
        >
            <div
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Carousel de Imagens */}
                <div className="h-64 relative overflow-hidden">
                    {imagens.length === 0 ? (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <span className="text-9xl">🍔</span>
                        </div>
                    ) : (
                        <>
                            <img
                                src={imagens[imagemAtiva]}
                                alt={produto.nome}
                                className="w-full h-full object-cover"
                            />

                            {/* Botão fechar */}
                            <button
                                onClick={onFechar}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors shadow-lg z-10"
                            >
                                ✕
                            </button>

                            {/* Setas de navegação */}
                            {imagens.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setImagemAtiva((imagemAtiva - 1 + imagens.length) % imagens.length)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
                                    >
                                        ←
                                    </button>
                                    <button
                                        onClick={() => setImagemAtiva((imagemAtiva + 1) % imagens.length)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
                                    >
                                        →
                                    </button>
                                </>
                            )}

                            {/* Indicadores */}
                            {imagens.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                    {imagens.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setImagemAtiva(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === imagemAtiva ? 'bg-white w-6' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Informações do Produto */}
                <div className="p-6">
                    {/* Cabeçalho */}
                    <div className="border-b pb-4 mb-4">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            {produto.nome}
                        </h2>
                        <p className="text-3xl font-bold text-orange-500">
                            {formatarPreco(produto.preco)}
                        </p>
                    </div>

                    {/* Descrição */}
                    {produto.descricao && (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                                📝 Descrição
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {produto.descricao}
                            </p>
                        </div>
                    )}

                    {/* Ingredientes */}
                    {produto.ingredientes && (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                🥘 Ingredientes
                            </h3>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex flex-wrap gap-2">
                                    {produto.ingredientes.split(',').map((ingrediente, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
                                        >
                                            {ingrediente.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Categoria */}
                    {produto.categoria && (
                        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                            <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full font-medium">
                                {produto.categoria.nome}
                            </span>
                        </div>
                    )}

                    {/* Controles */}
                    <div className="border-t pt-4">
                        {quantidadeNoCarrinho > 0 ? (
                            <div className="flex items-center gap-4">
                                <div className="flex-1 flex items-center justify-between bg-orange-100 rounded-xl p-4">
                                    <button
                                        onClick={() => onRemover(produto.id)}
                                        className="w-12 h-12 bg-orange-500 text-white rounded-full text-2xl font-bold hover:bg-orange-600 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="text-3xl font-bold text-orange-600">
                                        {quantidadeNoCarrinho}
                                    </span>
                                    <button
                                        onClick={() => onAdicionar(produto)}
                                        className="w-12 h-12 bg-orange-500 text-white rounded-full text-2xl font-bold hover:bg-orange-600 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={onFechar}
                                    className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                                >
                                    Fechar
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    onAdicionar(produto);
                                    onFechar();
                                }}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
                            >
                                Adicionar ao Carrinho - {formatarPreco(produto.preco)}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
