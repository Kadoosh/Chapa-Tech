import { formatarPreco } from '../../utils/formatters';

/**
 * Modal do carrinho de compras
 */
export function CarrinhoModal({
    carrinho,
    totalCarrinho,
    onFechar,
    onContinuar,
    onAdicionar,
    onRemover
}) {
    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
            onClick={onFechar}
        >
            <div
                className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Seu Pedido</h2>
                    <button
                        onClick={onFechar}
                        className="text-gray-500 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {carrinho.map(item => (
                        <div key={item.id} className="flex items-center gap-4 py-4 border-b">
                            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
                                <span className="text-3xl">🍔</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800">{item.nome}</h3>
                                <p className="text-orange-500 font-bold">
                                    {formatarPreco(item.preco * item.quantidade)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onRemover(item.id)}
                                    className="w-8 h-8 bg-gray-200 rounded-full text-lg font-bold"
                                >
                                    -
                                </button>
                                <span className="font-bold text-lg w-6 text-center">
                                    {item.quantidade}
                                </span>
                                <button
                                    onClick={() => onAdicionar(item)}
                                    className="w-8 h-8 bg-orange-500 text-white rounded-full text-lg font-bold"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t">
                    <div className="flex justify-between text-xl font-bold mb-4">
                        <span>Total:</span>
                        <span className="text-orange-500">{formatarPreco(totalCarrinho)}</span>
                    </div>
                    <button
                        onClick={onContinuar}
                        disabled={carrinho.length === 0}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-bold text-xl disabled:opacity-50"
                    >
                        Continuar →
                    </button>
                </div>
            </div>
        </div>
    );
}
