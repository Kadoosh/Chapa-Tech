import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CORES = ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#c026d3'];

export function GraficoProdutos({ dados, isLoading }) {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">🍔 Top Produtos</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados || []} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis 
              dataKey="nome" 
              type="category" 
              tick={{ fontSize: 11 }} 
              width={100}
              stroke="#9ca3af"
            />
            <Tooltip 
              formatter={(value) => [`${value} vendidos`, 'Quantidade']}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="quantidade" radius={[0, 4, 4, 0]}>
              {(dados || []).map((_, index) => (
                <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
