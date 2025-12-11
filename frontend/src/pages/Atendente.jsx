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
  const adicionarProduto = (produto) => {
    const itemExistente = carrinho.find((item) => item.id === produto.id);
    if (itemExistente) {
      setCarrinho(
        carrinho.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      );
    } else {
      setCarrinho([
        ...carrinho,
        {
          id: produto.id,
          produtoId: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: 1,
          observacao: '',
        },
      ]);
    }
    // Abrir carrinho em mobile
    if (window.innerWidth < 768) {
      setCarrinhoAberto(true);
    }
  };

  const atualizarQuantidade = (itemId, novaQuantidade) => {
    if (novaQuantidade < 1) return;
    setCarrinho(
      carrinho.map((item) =>
        item.id === itemId ? { ...item, quantidade: novaQuantidade } : item
      )
    );
  };

  const removerItem = (itemId) => {
    setCarrinho(carrinho.filter((item) => item.id !== itemId));
  };

  const atualizarObservacao = (itemId, observacao) => {
    setCarrinho(
      carrinho.map((item) =>
        item.id === itemId ? { ...item, observacao } : item
      )
    );
  };

  const limparCarrinho = () => {
    setCarrinho([]);
    setMesaSelecionada(null);
    setClienteSelecionado(null);
  };

  const finalizarPedido = async () => {
    if (!mesaSelecionada) {
      setFeedback({ open: true, type: 'warning', title: 'Atenção!', message: 'Selecione uma mesa antes de finalizar o pedido!' });
      return;
    }

    if (carrinho.length === 0) {
      setFeedback({ open: true, type: 'warning', title: 'Atenção!', message: 'Adicione produtos ao carrinho!' });
      return;
    }

    try {
      const pedidoData = {
        mesaId: mesaSelecionada,
        itens: carrinho.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          ...(item.observacao && { observacao: item.observacao }),
        })),
      };

      // Adicionar clienteId apenas se houver cliente
      if (clienteSelecionado?.id) {
        pedidoData.clienteId = clienteSelecionado.id;
        pedidoData.observacao = `Cliente: ${clienteSelecionado.nome} ${clienteSelecionado.sobrenome}`;
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

      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold">Atendente</h1>
              <p className="text-sm opacity-90">Olá, {user?.nome}</p>
            </div>
            <button
              onClick={() => setModalClienteAberto(true)}
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              {clienteSelecionado
                ? `${clienteSelecionado.nome} ${clienteSelecionado.sobrenome}`
                : 'Selecionar Cliente'}
            </button>
          </div>

          {/* Busca */}
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        {/* Seletor de Mesa */}
        <div className="bg-primary-700 py-3">
          <MesaSelector
            mesas={mesas?.data}
            mesaSelecionada={mesaSelecionada}
            onSelect={setMesaSelecionada}
            isLoading={carregandoMesas}
          />
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Área de produtos */}
        <div className="flex-1 overflow-y-auto">
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
    </div>
  );
}
