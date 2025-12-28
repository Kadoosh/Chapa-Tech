import { formatarPreco } from '../../utils/formatters';

/**
 * Tela de confirmação de pedido enviado
 */
export function ConfirmacaoScreen({
    tipoAtendimento,
    numeroMarcador,
    totalCarrinho,
    onNovoPedido
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col items-center justify-center p-8">
            <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-md w-full text-center">
                <span className="text-8xl mb-6 block">✅</span>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Pedido Enviado!
                </h2>

                {tipoAtendimento === 'local' && (
                    <p className="text-xl text-gray-600 mb-4">
                        Aguarde na mesa com o marcador <strong>#{numeroMarcador}</strong>
                    </p>
                )}

                {tipoAtendimento === 'viagem' && (
                    <p className="text-xl text-gray-600 mb-4">
                        Aguarde seu pedido no balcão
                    </p>
                )}

                <p className="text-2xl font-bold text-orange-500 mb-8">
                    Total: {formatarPreco(totalCarrinho)}
                </p>

                <button
                    onClick={onNovoPedido}
                    className="w-full bg-green-500 text-white text-xl font-bold py-4 rounded-2xl hover:bg-green-600 transition-colors"
                >
                    Novo Pedido
                </button>
            </div>
        </div>
    );
}
