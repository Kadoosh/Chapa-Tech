export function MesaCard({ mesa, totalGasto, onClick }) {
  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco || 0);
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 border-2 border-primary-200 hover:border-primary-500"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
            {mesa.numero}
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900">Mesa {mesa.numero}</h3>
            <span className="text-sm text-gray-600 capitalize">{mesa.status}</span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            mesa.status === 'ocupada'
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {mesa.status === 'ocupada' ? '🔴 Ocupada' : '🟢 Livre'}
        </span>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-medium">Total Consumido:</span>
          <span className="text-2xl font-bold text-primary-600">
            {formatarPreco(totalGasto)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="bg-primary-50 rounded-lg p-2 text-center">
          <span className="text-sm font-medium text-primary-700">
            Clique para ver detalhes
          </span>
        </div>
      </div>
    </button>
  );
}
