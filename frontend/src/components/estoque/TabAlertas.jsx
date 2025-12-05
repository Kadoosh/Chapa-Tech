import { useProdutosEstoqueBaixo } from '../../hooks/useEstoque';

export function TabAlertas({ onEntrada }) {
  const { data: alertasData, isLoading } = useProdutosEstoqueBaixo();
  
  const alertas = alertasData?.data || [];

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (alertas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Tudo em ordem!
        </h3>
        <p className="text-gray-600">
          Nenhum produto com estoque baixo no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-800">Atenção!</h3>
            <p className="text-sm text-yellow-700">
              {alertas.length} produto(s) com estoque abaixo do mínimo
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {alertas.map((produto) => {
          const percentual = produto.estoqueMinimo > 0 
            ? Math.round((produto.quantidadeEstoque / produto.estoqueMinimo) * 100)
            : 0;
          
          return (
            <div 
              key={produto.id} 
              className={`
                bg-white rounded-lg shadow-md p-4 border-l-4
                ${produto.quantidadeEstoque === 0 ? 'border-red-500' : 'border-yellow-500'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                    ${produto.quantidadeEstoque === 0 ? 'bg-red-100' : 'bg-yellow-100'}
                  `}>
                    {produto.quantidadeEstoque === 0 ? '🚨' : '⚠️'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{produto.nome}</h4>
                    <p className="text-sm text-gray-600">
                      {produto.categoria?.nome || 'Sem categoria'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {produto.quantidadeEstoque}
                    </p>
                    <p className="text-xs text-gray-500">Atual</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-600">
                      {produto.estoqueMinimo}
                    </p>
                    <p className="text-xs text-gray-500">Mínimo</p>
                  </div>

                  <div className="w-24">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{percentual}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          percentual === 0 ? 'bg-red-500' :
                          percentual < 50 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentual, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onEntrada(produto)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <span>📥</span>
                    Repor
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
