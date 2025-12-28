import { formatarPreco } from '../../utils/formatters';

/**
 * Tela para digitar o número do marcador da mesa
 */
export function MarcadorScreen({
    numeroMarcador,
    onNumeroChange,
    totalCarrinho,
    enviando,
    onVoltar,
    onConfirmar
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex flex-col items-center justify-center p-8">
            <button
                onClick={onVoltar}
                className="absolute top-6 left-6 text-white text-xl"
            >
                ← Voltar
            </button>

            <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-md w-full text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Número da Mesa
                </h2>
                <p className="text-gray-600 mb-8">
                    Digite o número do marcador da sua mesa:
                </p>

                <input
                    type="number"
                    value={numeroMarcador}
                    onChange={(e) => onNumeroChange(e.target.value)}
                    placeholder="Ex: 12"
                    className="w-full text-center text-5xl font-bold p-6 border-2 border-gray-300 rounded-2xl mb-8 focus:outline-none focus:border-orange-500"
                    autoFocus
                />

                <button
                    onClick={onConfirmar}
                    disabled={!numeroMarcador.trim() || enviando}
                    className="w-full bg-green-500 text-white text-xl font-bold py-4 rounded-2xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {enviando ? 'Enviando...' : 'Confirmar Pedido ✓'}
                </button>

                <p className="text-sm text-gray-500 mt-4">
                    Total: {formatarPreco(totalCarrinho)}
                </p>
            </div>
        </div>
    );
}
