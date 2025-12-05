import { useState } from 'react';
import { useProdutosComEstoque } from '../../hooks/useEstoque';
import { useCategorias } from '../../hooks/useProdutos';

export function TabProdutos({ onEntrada, onSaida, onAjuste }) {
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  
  const { data: produtosData, isLoading } = useProdutosComEstoque();
  const { data: categoriasData } = useCategorias();
  
  const produtos = produtosData?.data || [];
  const categorias = categoriasData?.data || [];

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(produto => {
    const matchBusca = produto.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = !categoriaFiltro || produto.categoriaId === parseInt(categoriaFiltro);
    return matchBusca && matchCategoria;
  });

  const getStatusEstoque = (produto) => {
    const qtd = produto.quantidadeEstoque || 0;
    const min = produto.estoqueMinimo || 0;
    
    if (qtd === 0) return { cor: 'bg-red-100 text-red-800', texto: 'Sem estoque' };
    if (qtd <= min) return { cor: 'bg-yellow-100 text-yellow-800', texto: 'Estoque baixo' };
    return { cor: 'bg-green-100 text-green-800', texto: 'Normal' };
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
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todas categorias</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nome}</option>
          ))}
        </select>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estoque Atual
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mínimo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => {
                  const status = getStatusEstoque(produto);
                  return (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center text-xl">
                            🍔
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {produto.nome}
                            </div>
                            <div className="text-sm text-gray-500">
                              R$ {produto.preco?.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {produto.categoria?.nome || '–'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-gray-900">
                          {produto.quantidadeEstoque || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {produto.estoqueMinimo || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.cor}`}>
                          {status.texto}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEntrada(produto)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Entrada"
                          >
                            📥
                          </button>
                          <button
                            onClick={() => onSaida(produto)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Saída"
                          >
                            📤
                          </button>
                          <button
                            onClick={() => onAjuste(produto)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ajustar"
                          >
                            ⚙️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
