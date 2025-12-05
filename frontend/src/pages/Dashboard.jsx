import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  useKPIs,
  useFaturamento,
  useTopProdutos,
} from '../hooks/useDashboard';
import { KPICard } from '../components/dashboard/KPICard';
import { FiltrosPeriodo } from '../components/dashboard/FiltrosPeriodo';
import { GraficoFaturamento } from '../components/dashboard/GraficoFaturamento';
import { GraficoProdutos } from '../components/dashboard/GraficoProdutos';

export function Dashboard() {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState('hoje');

  // Queries
  const { data: dashboardData, isLoading: loadingKPIs } = useKPIs(periodo);
  const { data: faturamentoData, isLoading: loadingFaturamento } = useFaturamento(periodo);
  const { data: produtosData, isLoading: loadingProdutos } = useTopProdutos(10);

  // Extrair dados da resposta do dashboard geral
  const dashboard = dashboardData || {};
  const vendas = dashboard.vendas || {};
  const operacional = dashboard.operacional || {};
  const clientes = dashboard.clientes || {};
  const statusPedidos = operacional.statusPedidos || {};
  const ocupacao = operacional.ocupacaoMesas || {};

  // Formatar dados para o gráfico de faturamento
  const faturamento = (faturamentoData || []).map(item => ({
    data: new Date(item.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    valor: item._sum?.total || 0
  }));

  // Formatar dados para o gráfico de produtos
  const produtos = (produtosData || []).map(item => ({
    nome: item.produto?.nome || 'Produto',
    quantidade: item.quantidadeVendida || 0
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">📊 Dashboard</h1>
              <p className="text-sm opacity-90 mt-1">Olá, {user?.nome}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm opacity-90">Última atualização</p>
                <p className="font-semibold">
                  {new Date().toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <a
                href="/hub"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                ← Voltar
              </a>
            </div>
          </div>

          {/* Filtros */}
          <FiltrosPeriodo periodo={periodo} onChangePeriodo={setPeriodo} />
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPIs Principais */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Resumo do Período
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              titulo="Faturamento Total"
              valor={vendas.totalVendas || 0}
              icone="💰"
              formato="moeda"
              cor="primary"
              isLoading={loadingKPIs}
            />
            <KPICard
              titulo="Total de Pedidos"
              valor={vendas.totalPedidos || 0}
              icone="📦"
              formato="numero"
              cor="blue"
              isLoading={loadingKPIs}
            />
            <KPICard
              titulo="Ticket Médio"
              valor={vendas.ticketMedio || 0}
              icone="🎫"
              formato="moeda"
              cor="green"
              isLoading={loadingKPIs}
            />
            <KPICard
              titulo="Itens Vendidos"
              valor={vendas.totalItensVendidos || 0}
              icone="🍔"
              formato="numero"
              cor="yellow"
              isLoading={loadingKPIs}
            />
          </div>
        </section>

        {/* Gráficos */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraficoFaturamento dados={faturamento} isLoading={loadingFaturamento} />
          <GraficoProdutos dados={produtos} isLoading={loadingProdutos} />
        </section>

        {/* Status Operacional */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Status Operacional
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              titulo="Pedidos Pendentes"
              valor={statusPedidos.pendente || 0}
              icone="⏳"
              formato="numero"
              cor="yellow"
              isLoading={loadingKPIs}
            />
            <KPICard
              titulo="Em Preparo"
              valor={statusPedidos.preparando || 0}
              icone="👨‍🍳"
              formato="numero"
              cor="blue"
              isLoading={loadingKPIs}
            />
            <KPICard
              titulo="Prontos"
              valor={statusPedidos.pronto || 0}
              icone="✅"
              formato="numero"
              cor="green"
              isLoading={loadingKPIs}
            />
            <KPICard
              titulo="Mesas Ocupadas"
              valor={`${ocupacao.ocupadas || 0}/${ocupacao.total || 0}`}
              icone="🪑"
              formato="texto"
              cor="purple"
              isLoading={loadingKPIs}
            />
          </div>
        </section>

        {/* Métricas de Desempenho */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Métricas de Desempenho
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-primary-600">
                {operacional.tempoMedioPreparo?.tempoMedio ? 
                  `${Math.round(operacional.tempoMedioPreparo.tempoMedio)} min` : 
                  '– min'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Tempo Médio de Preparo</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {ocupacao.taxaOcupacao ? `${ocupacao.taxaOcupacao}%` : '–'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Taxa de Ocupação</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {clientes.totalClientesAtivos || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Clientes Ativos</p>
            </div>
          </div>
        </section>

        {/* Pedidos Cancelados */}
        {vendas.pedidosCancelados > 0 && (
          <section className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-800">⚠️ Pedidos Cancelados</h3>
                <p className="text-red-600">{vendas.pedidosCancelados} pedido(s) cancelado(s) no período</p>
              </div>
              <span className="text-4xl">❌</span>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
