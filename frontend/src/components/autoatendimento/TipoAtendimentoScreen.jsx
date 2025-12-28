/**
 * Tela de seleção do tipo de atendimento (Local ou Viagem)
 */
import { formatarPreco } from '../../utils/formatters';

export function TipoAtendimentoScreen({ totalCarrinho, onVoltar, onSelecionarTipo }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex flex-col items-center justify-center p-8">
            <button
                onClick={onVoltar}
                className="absolute top-6 left-6 text-white text-xl"
            >
                ← Voltar
            </button>

            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white mb-4">🔥 ChapaTech</h1>
                <p className="text-2xl text-white/90">Como deseja receber?</p>
                <p className="text-lg text-white/70 mt-2">Total: {formatarPreco(totalCarrinho)}</p>
            </div>

            <div className="flex gap-8">
                <button
                    onClick={() => onSelecionarTipo('local')}
                    className="bg-white rounded-3xl p-12 shadow-2xl hover:scale-105 transition-transform flex flex-col items-center min-w-[200px]"
                >
                    <span className="text-7xl mb-4">🍽️</span>
                    <span className="text-2xl font-bold text-gray-800">Comer Aqui</span>
                    <span className="text-sm text-gray-500 mt-2">Precisaremos do número da mesa</span>
                </button>

                <button
                    onClick={() => onSelecionarTipo('viagem')}
                    className="bg-white rounded-3xl p-12 shadow-2xl hover:scale-105 transition-transform flex flex-col items-center min-w-[200px]"
                >
                    <span className="text-7xl mb-4">🛍️</span>
                    <span className="text-2xl font-bold text-gray-800">Para Viagem</span>
                    <span className="text-sm text-gray-500 mt-2">Retirar no balcão</span>
                </button>
            </div>
        </div>
    );
}
