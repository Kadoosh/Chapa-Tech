export function KPICard({ titulo, valor, icone, variacao, formato = 'numero', cor = 'primary', isLoading = false }) {
  const formatarValor = () => {
    if (formato === 'texto') {
      return valor || '–';
    }
    if (formato === 'moeda') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor || 0);
    }
    if (formato === 'percentual') {
      return `${parseFloat(valor || 0).toFixed(1)}%`;
    }
    return (valor || 0).toLocaleString('pt-BR');
  };

  const getCor = () => {
    const cores = {
      primary: 'bg-primary-600',
      green: 'bg-green-600',
      blue: 'bg-blue-600',
      yellow: 'bg-yellow-600',
      purple: 'bg-purple-600',
    };
    return cores[cor] || cores.primary;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{titulo}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{formatarValor()}</p>
          {variacao !== undefined && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-semibold ${
                  variacao >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {variacao >= 0 ? '↑' : '↓'} {Math.abs(variacao).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs período anterior</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${getCor()} rounded-lg flex items-center justify-center`}>
          <span className="text-2xl">{icone}</span>
        </div>
      </div>
    </div>
  );
}
