import { useState } from 'react';
import { useMovimentacoes } from '../../hooks/useEstoque';

export function TabMovimentacoes() {
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('7');
  
  const { data: movimentacoesData, isLoading } = useMovimentacoes({
    tipo: filtroTipo || undefined,
    dias: filtroPeriodo,
  });
  
  const movimentacoes = movimentacoesData?.data || [];

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos os tipos</option>
          <option value="entrada">📥 Entradas</option>
          <option value="saida">📤 Saídas</option>
          <option value="ajuste">⚙️ Ajustes</option>
        </select>
        <select
          value={filtroPeriodo}
          onChange={(e) => setFiltroPeriodo(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="7">Últimos 7 dias</option>
          <option value="15">Últimos 15 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
        </select>
      </div>

      {/* Lista de Movimentações */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movimentacoes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Nenhuma movimentação encontrada
                  </td>
                </tr>
              ) : (
                movimentacoes.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(mov.criadoEm)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${mov.tipo === 'entrada' ? 'bg-green-100 text-green-800' : ''}
                        ${mov.tipo === 'saida' ? 'bg-red-100 text-red-800' : ''}
                        ${mov.tipo === 'ajuste' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {mov.tipo === 'entrada' && '📥 Entrada'}
                        {mov.tipo === 'saida' && '📤 Saída'}
                        {mov.tipo === 'ajuste' && '⚙️ Ajuste'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {mov.produto?.nome || 'Produto removido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`
                        text-lg font-bold
                        ${mov.tipo === 'entrada' ? 'text-green-600' : ''}
                        ${mov.tipo === 'saida' ? 'text-red-600' : ''}
                        ${mov.tipo === 'ajuste' ? 'text-blue-600' : ''}
                      `}>
                        {mov.tipo === 'entrada' ? '+' : mov.tipo === 'saida' ? '-' : ''}
                        {mov.quantidade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {mov.observacao || '–'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mov.usuario?.nome || '–'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
