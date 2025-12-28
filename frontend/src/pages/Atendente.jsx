import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProdutos, useCategorias } from '../hooks/useProdutos';
import { useMesas } from '../hooks/useMesas';
import { useCarrinhoAtendente } from '../hooks/useCarrinhoAtendente';
import { CategoriaList } from '../components/atendente/CategoriaList';
import { ProdutoList } from '../components/atendente/ProdutoList';
import { Carrinho } from '../components/atendente/Carrinho';
import { MesaSelector } from '../components/atendente/MesaSelector';
import { ClienteModal } from '../components/atendente/ClienteModal';
import { AcompanhamentosModal } from '../components/atendente/AcompanhamentosModal';
import { FeedbackModal } from '../components/common/FeedbackModal';
import { HiddenHeader } from '../components/common/HiddenHeader';

export function Atendente() {
  const { user } = useAuth();

  // Estados de UI
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [busca, setBusca] = useState('');
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, type: 'success', title: '', message: '' });
  const [modalAcompanhamentos, setModalAcompanhamentos] = useState({ open: false, produto: null, acompanhamentos: [] });

  // Hook do carrinho
  const {
    carrinho,
    mesaSelecionada,
    setMesaSelecionada,
    clienteSelecionado,
    setClienteSelecionado,
    paraViagem,
    setParaViagem,
    observacaoGeral,
    setObservacaoGeral,
    carrinhoAberto,
    setCarrinhoAberto,
    isLoading,
    adicionarProdutoAoCarrinho,
    atualizarQuantidade,
    removerItem,
    atualizarObservacao,
    finalizarPedido,
  } = useCarrinhoAtendente();

  // Queries
  const { data: categorias } = useCategorias();
  const { data: produtos, isLoading: carregandoProdutos } = useProdutos({
    categoriaId: categoriaSelecionada,
    busca: busca || undefined,
    disponivel: true,
  });
  const { data: mesas, isLoading: carregandoMesas } = useMesas();

  // Handler para clique no produto
  const handleProdutoClick = (produto) => {
    const categoriaDoProduto = categorias?.data?.find((c) => c.id === produto.categoriaId);
    const acompanhamentosCategoria = categoriaDoProduto?.acompanhamentos || [];

    if (acompanhamentosCategoria.length > 0) {
      setModalAcompanhamentos({
        open: true,
        produto,
        acompanhamentos: acompanhamentosCategoria.filter((a) => a.disponivel !== false),
      });
    } else {
      adicionarProdutoAoCarrinho(produto, []);
    }
  };

  // Handler para confirmar acompanhamentos
  const handleConfirmarAcompanhamentos = (produto, acompanhamentos) => {
    adicionarProdutoAoCarrinho(produto, acompanhamentos);
  };

  // Handler para finalizar pedido
  const handleFinalizarPedido = async () => {
    const result = await finalizarPedido();

    if (result.success) {
      setFeedback({ open: true, type: 'success', title: 'Sucesso!', message: result.message });
    } else {
      setFeedback({ open: true, type: 'warning', title: 'Atenção!', message: result.message });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Hidden Header */}
      <HiddenHeader />

      {/* Header - Responsivo */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="px-3 py-2 md:px-4 md:py-3">
          {/* Linha única: Saudação + Chip de Cliente */}
          <div className="flex items-center justify-between gap-3">
            {/* Saudação */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs opacity-75">Bem-vindo(a),</span>
              <h1 className="text-base md:text-lg font-semibold truncate">
                {user?.nome || 'Atendente'}
              </h1>
            </div>

            {/* Chip de Cliente - Compacto */}
            <button
              onClick={() => setModalClienteAberto(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all shrink-0 ${clienteSelecionado
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-white/20 hover:bg-white/30 border border-white/40'
                }`}
            >
              <span className="text-base">{clienteSelecionado ? '👤' : '➕'}</span>
              <span className="hidden sm:inline max-w-[120px] truncate">
                {clienteSelecionado
                  ? clienteSelecionado.nome
                  : 'Cliente'}
              </span>
            </button>
          </div>
        </div>

        {/* Seletor de Mesa com 3 abas */}
        <div className="bg-primary-700">
          <MesaSelector
            mesas={mesas?.data}
            mesaSelecionada={mesaSelecionada}
            onSelect={setMesaSelecionada}
            isLoading={carregandoMesas}
            paraViagem={paraViagem}
            onParaViagemChange={setParaViagem}
          />
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Área de produtos */}
        <div className="flex-1 overflow-y-auto">
          {/* Busca */}
          <div className="p-3 md:p-4 bg-white border-b sticky top-0 z-10">
            <input
              type="text"
              placeholder="🔍 Buscar produtos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
            />
          </div>

          <CategoriaList
            categorias={categorias?.data}
            categoriaSelecionada={categoriaSelecionada}
            onSelect={setCategoriaSelecionada}
          />

          <ProdutoList
            produtos={produtos?.data}
            isLoading={carregandoProdutos}
            onAddProduto={handleProdutoClick}
            busca={busca}
          />
        </div>

        {/* Carrinho - Desktop */}
        <aside className="hidden md:block w-96 border-l shadow-xl">
          <Carrinho
            itens={carrinho}
            onUpdateQuantidade={atualizarQuantidade}
            onRemove={removerItem}
            onUpdateObservacao={atualizarObservacao}
            onFinalizarPedido={handleFinalizarPedido}
            isLoading={isLoading}
            observacaoGeral={observacaoGeral}
            onUpdateObservacaoGeral={setObservacaoGeral}
          />
        </aside>
      </div>

      {/* Carrinho - Mobile (overlay) */}
      {carrinhoAberto && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setCarrinhoAberto(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl h-3/4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Carrinho</h2>
              <button
                onClick={() => setCarrinhoAberto(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Carrinho
                itens={carrinho}
                onUpdateQuantidade={atualizarQuantidade}
                onRemove={removerItem}
                onUpdateObservacao={atualizarObservacao}
                onFinalizarPedido={handleFinalizarPedido}
                isLoading={isLoading}
                observacaoGeral={observacaoGeral}
                onUpdateObservacaoGeral={setObservacaoGeral}
              />
            </div>
          </div>
        </div>
      )}

      {/* Botão flutuante de carrinho - Mobile */}
      <button
        onClick={() => setCarrinhoAberto(true)}
        className="md:hidden fixed bottom-6 right-6 bg-primary-600 text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center hover:bg-primary-700 transition-colors z-40"
      >
        <div className="relative">
          <span className="text-2xl">🛒</span>
          {carrinho.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {carrinho.length}
            </span>
          )}
        </div>
      </button>

      {/* Modal de Cliente */}
      <ClienteModal
        isOpen={modalClienteAberto}
        onClose={() => setModalClienteAberto(false)}
        onSelectCliente={setClienteSelecionado}
      />

      {/* Modal de Feedback */}
      <FeedbackModal
        isOpen={feedback.open}
        onClose={() => setFeedback({ ...feedback, open: false })}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
      />

      {/* Modal de Acompanhamentos */}
      <AcompanhamentosModal
        isOpen={modalAcompanhamentos.open}
        onClose={() => setModalAcompanhamentos({ open: false, produto: null, acompanhamentos: [] })}
        produto={modalAcompanhamentos.produto}
        acompanhamentos={modalAcompanhamentos.acompanhamentos}
        onConfirm={handleConfirmarAcompanhamentos}
      />
    </div>
  );
}
