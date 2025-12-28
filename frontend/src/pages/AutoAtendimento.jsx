import { useAutoAtendimento } from '../hooks/useAutoAtendimento';
import { formatarPreco } from '../utils/formatters';
import {
    CategoriasSidebar,
    ProdutoGrid,
    CarrinhoModal,
    ProdutoDetalheModal,
    TipoAtendimentoScreen,
    MarcadorScreen,
    ConfirmacaoScreen,
} from '../components/autoatendimento';

/**
 * Auto Atendimento - Página PWA para tablets
 * Cliente faz o próprio pedido usando marcador numerado
 */
export function AutoAtendimento() {
    const {
        // Estados
        etapa,
        setEtapa,
        tipoAtendimento,
        numeroMarcador,
        setNumeroMarcador,
        carrinho,
        categoriaAtiva,
        setCategoriaAtiva,
        produtoSelecionado,
        setProdutoSelecionado,
        enviando,

        // Dados
        categorias,
        produtos,
        produtosCategoria,
        totalCarrinho,
        qtdItens,
        loadingCategorias,
        loadingProdutos,

        // Funções
        adicionarAoCarrinho,
        removerDoCarrinho,
        irParaTipo,
        selecionarTipo,
        confirmarMarcador,
        novoPedido,
    } = useAutoAtendimento();

    // ========================================
    // TELA TIPO - Escolher tipo APÓS carrinho
    // ========================================
    if (etapa === 'tipo') {
        return (
            <TipoAtendimentoScreen
                totalCarrinho={totalCarrinho}
                onVoltar={() => setEtapa('carrinho')}
                onSelecionarTipo={selecionarTipo}
            />
        );
    }

    // ========================================
    // TELA MARCADOR - Digitar número da mesa
    // ========================================
    if (etapa === 'marcador') {
        return (
            <MarcadorScreen
                numeroMarcador={numeroMarcador}
                onNumeroChange={setNumeroMarcador}
                totalCarrinho={totalCarrinho}
                enviando={enviando}
                onVoltar={() => setEtapa('tipo')}
                onConfirmar={confirmarMarcador}
            />
        );
    }

    // ========================================
    // TELA CONFIRMADO - Pedido enviado
    // ========================================
    if (etapa === 'confirmado') {
        return (
            <ConfirmacaoScreen
                tipoAtendimento={tipoAtendimento}
                numeroMarcador={numeroMarcador}
                totalCarrinho={totalCarrinho}
                onNovoPedido={novoPedido}
            />
        );
    }

    // ========================================
    // TELA CARDÁPIO - Produtos e carrinho
    // ========================================

    // Loading state
    if (loadingCategorias || loadingProdutos) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🍔</div>
                    <p className="text-xl text-gray-600">Carregando cardápio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            {/* Botão Carrinho Flutuante (Topo direito) */}
            {carrinho.length > 0 && (
                <button
                    onClick={() => setEtapa('carrinho')}
                    className="fixed top-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform"
                >
                    <span className="text-2xl">🛒</span>
                    <div className="flex flex-col items-start">
                        <span className="text-xs opacity-90">{qtdItens} {qtdItens === 1 ? 'item' : 'itens'}</span>
                        <span className="text-lg font-bold">{formatarPreco(totalCarrinho)}</span>
                    </div>
                </button>
            )}

            {/* Main Content - Sidebar + Produtos */}
            <div className="flex flex-1 overflow-hidden">
                <CategoriasSidebar
                    categorias={categorias}
                    produtos={produtos}
                    categoriaAtiva={categoriaAtiva}
                    onSelectCategoria={setCategoriaAtiva}
                />

                <ProdutoGrid
                    produtos={produtosCategoria}
                    categorias={categorias}
                    categoriaAtiva={categoriaAtiva}
                    carrinho={carrinho}
                    onClickProduto={setProdutoSelecionado}
                    onAdicionar={adicionarAoCarrinho}
                    onRemover={removerDoCarrinho}
                />
            </div>

            {/* Modal Carrinho */}
            {etapa === 'carrinho' && (
                <CarrinhoModal
                    carrinho={carrinho}
                    totalCarrinho={totalCarrinho}
                    onFechar={() => setEtapa('cardapio')}
                    onContinuar={irParaTipo}
                    onAdicionar={adicionarAoCarrinho}
                    onRemover={removerDoCarrinho}
                />
            )}

            {/* Modal Detalhes do Produto */}
            {produtoSelecionado && (
                <ProdutoDetalheModal
                    produto={produtoSelecionado}
                    carrinho={carrinho}
                    onFechar={() => setProdutoSelecionado(null)}
                    onAdicionar={adicionarAoCarrinho}
                    onRemover={removerDoCarrinho}
                />
            )}
        </div>
    );
}

export default AutoAtendimento;
