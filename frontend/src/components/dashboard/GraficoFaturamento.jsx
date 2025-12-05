import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function GraficoFaturamento({ dados, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Faturamento</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="data" 
              tick={{ fontSize: 12 }} 
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              stroke="#9ca3af"
              tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value) => [formatarMoeda(value), 'Faturamento']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="valor" 
              stroke="#dc2626" 
              fill="#fecaca"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
