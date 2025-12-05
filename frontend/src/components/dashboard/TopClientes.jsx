export function TopClientes({ dados, isLoading }) {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">👑 Top Clientes</h3>
      
      {!dados || dados.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dados.map((cliente, index) => (
            <div
              key={cliente.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                      ? 'bg-gray-400'
                      : index === 2
                      ? 'bg-amber-600'
                      : 'bg-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {cliente.nome} {cliente.sobrenome}
                  </p>
                  <p className="text-xs text-gray-500">
                    {cliente.totalPedidos} pedidos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">
                  {formatarMoeda(cliente.totalGasto)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
