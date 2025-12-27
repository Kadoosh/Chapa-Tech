import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProdutos, useCategorias } from '../hooks/useProdutos';
import { useMesas } from '../hooks/useMesas';
import { useCriarPedido } from '../hooks/usePedidos';
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

  // Estados
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [busca, setBusca] = useState('');
  const [mesaSelecionada, setMesaSelecionada] = useState(null);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, type: 'success', title: '', message: '' });
  const [paraViagem, setParaViagem] = useState(false);
  const [observacaoGeral, setObservacaoGeral] = useState('');
  const [modalAcompanhamentos, setModalAcompanhamentos] = useState({ open: false, produto: null, acompanhamentos: [] });

  // Queries
  const { data: categorias } = useCategorias();
  const { data: produtos, isLoading: carregandoProdutos } = useProdutos({
    categoriaId: categoriaSelecionada,
    busca: busca || undefined,
    disponivel: true,
  });
  const { data: mesas, isLoading: carregandoMesas } = useMesas();
  const criarPedido = useCriarPedido();

  // Funções do carrinho
  const handleProdutoClick = (produto) => {
    // Buscar a categoria do produto para ver se tem acompanhamentos
    const categoriaDoProduto = categorias?.data?.find((c) => c.id === produto.categoriaId);
    const acompanhamentosCategoria = categoriaDoProduto?.acompanhamentos || [];

    if (acompanhamentosCategoria.length > 0) {
      // Tem acompanhamentos - abrir modal
      setModalAcompanhamentos({
        open: true,
        produto,
        acompanhamentos: acompanhamentosCategoria.filter((a) => a.disponivel !== false),
      });
    } else {
      // Sem acompanhamentos - adicionar direto
      adicionarProdutoAoCarrinho(produto, []);
    }
  };

  const adicionarProdutoAoCarrinho = (produto, acompanhamentosSelecionados = []) => {
    // Gerar ID único para o item (produto + acompanhamentos)
    const acompIds = acompanhamentosSelecionados.map((a) => a.id).sort().join('-');
    const itemId = acompIds ? `${produto.id}-${acompIds}` : `${produto.id}`;

    const precoTotal = produto.preco + acompanhamentosSelecionados.reduce((acc, a) => acc + a.valor, 0);

    const itemExistente = carrinho.find((item) => item.itemId === itemId);
    if (itemExistente) {
      setCarrinho(
        carrinho.map((item) =>
          item.itemId === itemId
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      );
    } else {
      setCarrinho([
        ...carrinho,
        {
          itemId,
          id: produto.id,
          produtoId: produto.id,
          nome: produto.nome,
          preco: precoTotal,
          precoBase: produto.preco,
          quantidade: 1,
          observacao: '',
          acompanhamentos: acompanhamentosSelecionados,
        },
      ]);
    }
    // Abrir carrinho em mobile
    if (window.innerWidth < 768) {
      setCarrinhoAberto(true);
    }
  };

  // Handler para confirmar no modal de acompanhamentos
  const handleConfirmarAcompanhamentos = (produto, acompanhamentos) => {
    adicionarProdutoAoCarrinho(produto, acompanhamentos);
  };

  // Função legada mantida para compatibilidade
  const adicionarProduto = (produto) => {
    handleProdutoClick(produto);
  };

  const atualizarQuantidade = (itemId, novaQuantidade) => {
    if (novaQuantidade < 1) return;
    setCarrinho(
      carrinho.map((item) =>
        item.itemId === itemId ? { ...item, quantidade: novaQuantidade } : item
      )
    );
  };

  const removerItem = (itemId) => {
    setCarrinho(carrinho.filter((item) => item.itemId !== itemId));
  };

  const atualizarObservacao = (itemId, observacao) => {
    setCarrinho(
      carrinho.map((item) =>
        item.itemId === itemId ? { ...item, observacao } : item
      )
    );
  };

  const limparCarrinho = () => {
    setCarrinho([]);
    setMesaSelecionada(null);
    setClienteSelecionado(null);
    setParaViagem(false);
    setObservacaoGeral('');
  };

  const finalizarPedido = async () => {
    if (!paraViagem && !mesaSelecionada) {
      setFeedback({ open: true, type: 'warning', title: 'Atenção!', message: 'Selecione uma mesa ou marque "Para Viagem"!' });
      return;
    }

    if (carrinho.length === 0) {
      setFeedback({ open: true, type: 'warning', title: 'Atenção!', message: 'Adicione produtos ao carrinho!' });
      return;
    }

    try {
      const pedidoData = {
        mesaId: paraViagem ? null : mesaSelecionada,
        paraViagem,
        itens: carrinho.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          ...(item.observacao && { observacao: item.observacao }),
        })),
      };

      // Montar observação do pedido
      let observacoes = [];

      // Adicionar clienteId apenas se houver cliente
      if (clienteSelecionado?.id) {
        pedidoData.clienteId = clienteSelecionado.id;
        const nomeCompleto = clienteSelecionado.sobrenome
          ? `${clienteSelecionado.nome} ${clienteSelecionado.sobrenome}`
          : clienteSelecionado.nome;
        observacoes.push(`Cliente: ${nomeCompleto}`);
      } else if (clienteSelecionado?.nome) {
        // Cliente temporário (Pedido Rápido) - só tem nome
        observacoes.push(`Cliente: ${clienteSelecionado.nome}`);
      }

      // Adicionar observação geral se houver
      if (observacaoGeral.trim()) {
        observacoes.push(observacaoGeral.trim());
      }

      if (observacoes.length > 0) {
        pedidoData.observacao = observacoes.join(' | ');
      }

      await criarPedido.mutateAsync(pedidoData);

      // Limpar formulário
      limparCarrinho();
      setCarrinhoAberto(false);

      setFeedback({ open: true, type: 'success', title: 'Sucesso!', message: 'Pedido enviado para a cozinha! 🍽️' });
    } catch (error) {
      setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Hidden Header */}
      <HiddenHeader />

      {/* Header - Responsivo */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="px-3 py-2 md:px-4 md:py-4">
          {/* Linha 1: Título + Cliente */}
          <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
            <h1 className="text-lg md:text-xl font-bold whitespace-nowrap">Atendente</h1>
            <button
              onClick={() => setModalClienteAberto(true)}
              className="bg-white text-primary-600 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium text-sm md:text-base hover:bg-gray-100 transition-colors truncate max-w-[180px] md:max-w-none"
            >
              {clienteSelecionado
                ? `${clienteSelecionado.nome}${clienteSelecionado.sobrenome ? ' ' + clienteSelecionado.sobrenome : ''}`
                : '+ Cliente'}
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
            onAddProduto={adicionarProduto}
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
            onFinalizarPedido={finalizarPedido}
            isLoading={criarPedido.isPending}
            observacaoGeral={observacaoGeral}
            onUpdateObservacaoGeral={setObservacaoGeral}
          />
        </aside>
      </div>

      {/* Carrinho - Mobile (overlay) */}
      {carrinhoAberto && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl h-3/4 flex flex-col">
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
                onFinalizarPedido={finalizarPedido}
                isLoading={criarPedido.isPending}
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
