import { useState } from 'react';

export function MesaSelector({ mesas, mesaSelecionada, onSelect, isLoading, paraViagem, onParaViagemChange }) {
  const [aba, setAba] = useState('livres'); // 'livres', 'ocupadas', 'viagem'

  if (isLoading) {
    return (
      <div className="px-3 py-2 md:px-4 md:py-3">
        <div className="w-full py-2 md:py-3 bg-white/20 rounded-lg md:rounded-xl text-white animate-pulse text-center text-sm md:text-base">
          Carregando...
        </div>
      </div>
    );
  }

  const mesasLivres = mesas?.filter((m) => m.status === 'livre') || [];
  const mesasOcupadas = mesas?.filter((m) => m.status === 'ocupada') || [];
  const mesaSelecionadaObj = mesas?.find((m) => m.id === mesaSelecionada);

  // Quando Para Viagem está ativo, mostrar aba viagem
  const abaAtual = paraViagem ? 'viagem' : aba;

  const handleSelectMesa = (mesaId) => {
    onSelect(mesaId);
    if (onParaViagemChange) onParaViagemChange(false);
  };

  const handleParaViagem = () => {
    if (onParaViagemChange) onParaViagemChange(true);
    onSelect(null);
    setAba('viagem');
  };

  return (
    <div className="px-3 py-2 md:px-4 md:py-3">
      {/* Abas - Responsivas */}
      <div className="flex gap-1.5 md:gap-2 mb-2">
        <button
          onClick={() => { setAba('livres'); if (onParaViagemChange) onParaViagemChange(false); }}
          className={`flex-1 py-2 md:py-3 px-2 md:px-3 rounded-lg md:rounded-xl font-medium text-xs md:text-sm transition-all flex items-center justify-center gap-1 md:gap-2 ${abaAtual === 'livres'
            ? 'bg-white text-green-700 shadow'
            : 'bg-white/20 text-white hover:bg-white/30'
            }`}
        >
          <span>🟢</span>
          <span>Livres ({mesasLivres.length})</span>
        </button>

        <button
          onClick={() => { setAba('ocupadas'); if (onParaViagemChange) onParaViagemChange(false); }}
          className={`flex-1 py-2 md:py-3 px-2 md:px-3 rounded-lg md:rounded-xl font-medium text-xs md:text-sm transition-all flex items-center justify-center gap-1 md:gap-2 ${abaAtual === 'ocupadas'
            ? 'bg-white text-orange-700 shadow'
            : 'bg-white/20 text-white hover:bg-white/30'
            }`}
        >
          <span>🔴</span>
          <span>Ocupadas ({mesasOcupadas.length})</span>
        </button>

        <button
          onClick={handleParaViagem}
          className={`flex-1 py-2 md:py-3 px-2 md:px-3 rounded-lg md:rounded-xl font-medium text-xs md:text-sm transition-all flex items-center justify-center gap-1 md:gap-2 ${abaAtual === 'viagem'
            ? 'bg-amber-400 text-amber-900 shadow'
            : 'bg-white/20 text-white hover:bg-white/30'
            }`}
        >
          <span>🛵</span>
          <span>Viagem</span>
        </button>
      </div>

      {/* Conteúdo da aba - Responsivo */}
      <div className="bg-white/10 rounded-lg md:rounded-xl p-1.5 md:p-2 max-h-16 md:max-h-20 overflow-x-auto">
        {abaAtual === 'livres' && (
          <div className="flex gap-1.5 md:gap-2">
            {mesasLivres.length === 0 ? (
              <p className="text-white/70 text-xs md:text-sm py-1.5 px-2">Nenhuma mesa livre</p>
            ) : (
              mesasLivres.map((mesa) => (
                <button
                  key={mesa.id}
                  onClick={() => handleSelectMesa(mesa.id)}
                  className={`min-w-[48px] md:min-w-[60px] h-10 md:h-14 rounded-lg font-bold text-base md:text-lg transition-all ${mesaSelecionada === mesa.id
                    ? 'bg-green-500 text-white shadow scale-105'
                    : 'bg-white text-green-700 hover:bg-green-100'
                    }`}
                >
                  {mesa.numero}
                </button>
              ))
            )}
          </div>
        )}

        {abaAtual === 'ocupadas' && (
          <div className="flex gap-1.5 md:gap-2">
            {mesasOcupadas.length === 0 ? (
              <p className="text-white/70 text-xs md:text-sm py-1.5 px-2">Nenhuma mesa ocupada</p>
            ) : (
              mesasOcupadas.map((mesa) => (
                <button
                  key={mesa.id}
                  onClick={() => handleSelectMesa(mesa.id)}
                  className={`min-w-[48px] md:min-w-[60px] h-10 md:h-14 rounded-lg font-bold text-base md:text-lg transition-all ${mesaSelecionada === mesa.id
                    ? 'bg-orange-500 text-white shadow scale-105'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                >
                  {mesa.numero}
                </button>
              ))
            )}
          </div>
        )}

        {abaAtual === 'viagem' && (
          <div className="flex items-center justify-center py-1 md:py-2 text-white">
            <div className="text-center">
              <span className="text-xl md:text-2xl">🛵</span>
              <p className="text-xs md:text-sm font-medium">Para viagem</p>
            </div>
          </div>
        )}
      </div>

      {/* Indicador de seleção - Só para mesa */}
      {mesaSelecionada && (
        <div className="mt-1.5 md:mt-2 text-center">
          <span className="text-white text-xs md:text-sm font-medium bg-white/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
            🍽️ Mesa {mesaSelecionadaObj?.numero}
          </span>
        </div>
      )}
    </div>
  );
}
