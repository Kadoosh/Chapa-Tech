export function MesaSelector({ mesas, mesaSelecionada, onSelect, isLoading }) {
  if (isLoading) {
    return (
      <div className="px-4 py-2">
        <p className="text-sm text-gray-500">Carregando mesas...</p>
      </div>
    );
  }

  const mesasLivres = mesas?.filter((m) => m.status === 'livre') || [];
  const mesasOcupadas = mesas?.filter((m) => m.status === 'ocupada') || [];

  return (
    <div className="px-4 py-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Selecione a Mesa
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {/* Mesas Livres */}
        {mesasLivres.map((mesa) => (
          <button
            key={mesa.id}
            onClick={() => onSelect(mesa.id)}
            className={`aspect-square rounded-lg border-2 font-semibold transition-all ${
              mesaSelecionada === mesa.id
                ? 'bg-primary-600 text-white border-primary-600 scale-110'
                : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
            }`}
          >
            {mesa.numero}
          </button>
        ))}

        {/* Mesas Ocupadas (desabilitadas) */}
        {mesasOcupadas.map((mesa) => (
          <button
            key={mesa.id}
            disabled
            className="aspect-square rounded-lg border-2 bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-50"
          >
            {mesa.numero}
          </button>
        ))}
      </div>

      {mesaSelecionada && (
        <p className="mt-2 text-sm text-gray-600">
          Mesa <strong>{mesas?.find((m) => m.id === mesaSelecionada)?.numero}</strong> selecionada
        </p>
      )}
    </div>
  );
}
