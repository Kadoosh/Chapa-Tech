import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCriarMovimentacao, useAjustarEstoque } from '../hooks/useEstoque';
import { TabProdutos } from '../components/estoque/TabProdutos';
import { TabMovimentacoes } from '../components/estoque/TabMovimentacoes';
import { TabAlertas } from '../components/estoque/TabAlertas';
import { MovimentacaoModal } from '../components/estoque/MovimentacaoModal';
import { AjusteModal } from '../components/estoque/AjusteModal';
import { FeedbackModal } from '../components/common/FeedbackModal';
import { HiddenHeader } from '../components/common/HiddenHeader';

const TABS = [
  { id: 'produtos', label: '📦 Produtos', icon: '📦' },
  { id: 'movimentacoes', label: '📋 Movimentações', icon: '📋' },
  { id: 'alertas', label: '⚠️ Alertas', icon: '⚠️' },
];

export function Estoque() {
  const { user } = useAuth();
  const [tabAtiva, setTabAtiva] = useState('produtos');

  // Modais
  const [modalEntrada, setModalEntrada] = useState({ open: false, produto: null });
  const [modalSaida, setModalSaida] = useState({ open: false, produto: null });
  const [modalAjuste, setModalAjuste] = useState({ open: false, produto: null });
  const [feedback, setFeedback] = useState({ open: false, type: 'success', title: '', message: '' });

  // Mutations
  const criarMovimentacao = useCriarMovimentacao();
  const ajustarEstoque = useAjustarEstoque();

  // Handlers
  const handleEntrada = (produto) => {
    setModalEntrada({ open: true, produto });
  };

  const handleSaida = (produto) => {
    setModalSaida({ open: true, produto });
  };

  const handleAjuste = (produto) => {
    setModalAjuste({ open: true, produto });
  };

  const handleSubmitMovimentacao = async (dados) => {
    try {
      await criarMovimentacao.mutateAsync(dados);
      setModalEntrada({ open: false, produto: null });
      setModalSaida({ open: false, produto: null });
      setFeedback({ open: true, type: 'success', title: 'Sucesso!', message: 'Movimentação registrada!' });
    } catch (error) {
      setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
    }
  };

  const handleSubmitAjuste = async (dados) => {
    try {
      await ajustarEstoque.mutateAsync(dados);
      setModalAjuste({ open: false, produto: null });
      setFeedback({ open: true, type: 'success', title: 'Sucesso!', message: 'Estoque ajustado!' });
    } catch (error) {
      setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden Header */}
      <HiddenHeader />

      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">📦 Controle de Estoque</h1>
              <p className="text-sm opacity-90 mt-1">Olá, {user?.nome}</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/hub"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                ← Voltar
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabAtiva(tab.id)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${tabAtiva === tab.id
                    ? 'bg-white text-primary-600 shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Ações Rápidas */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setModalEntrada({ open: true, produto: null })}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            📥 Nova Entrada
          </button>
          <button
            onClick={() => setModalSaida({ open: true, produto: null })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            📤 Nova Saída
          </button>
        </div>

        {/* Tab Content */}
        {tabAtiva === 'produtos' && (
          <TabProdutos
            onEntrada={handleEntrada}
            onSaida={handleSaida}
            onAjuste={handleAjuste}
          />
        )}

        {tabAtiva === 'movimentacoes' && (
          <TabMovimentacoes />
        )}

        {tabAtiva === 'alertas' && (
          <TabAlertas onEntrada={handleEntrada} />
        )}
      </main>

      {/* Modais */}
      <MovimentacaoModal
        isOpen={modalEntrada.open}
        onClose={() => setModalEntrada({ open: false, produto: null })}
        onSubmit={handleSubmitMovimentacao}
        tipo="entrada"
        produto={modalEntrada.produto}
        loading={criarMovimentacao.isPending}
      />

      <MovimentacaoModal
        isOpen={modalSaida.open}
        onClose={() => setModalSaida({ open: false, produto: null })}
        onSubmit={handleSubmitMovimentacao}
        tipo="saida"
        produto={modalSaida.produto}
        loading={criarMovimentacao.isPending}
      />

      <AjusteModal
        isOpen={modalAjuste.open}
        onClose={() => setModalAjuste({ open: false, produto: null })}
        onSubmit={handleSubmitAjuste}
        produto={modalAjuste.produto}
        loading={ajustarEstoque.isPending}
      />

      {/* Modal de Feedback */}
      <FeedbackModal
        isOpen={feedback.open}
        onClose={() => setFeedback({ ...feedback, open: false })}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
      />
    </div>
  );
}
