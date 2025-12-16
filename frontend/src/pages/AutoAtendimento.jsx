import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { getSocket } from '../services/socket';

/**
 * Auto Atendimento - Página PWA para tablets
 * Cliente faz o próprio pedido usando marcador numerado
 */
export function AutoAtendimento() {
    // Estados do fluxo
    const [etapa, setEtapa] = useState('cardapio'); // cardapio, carrinho, tipo, marcador, confirmado
    const [tipoAtendimento, setTipoAtendimento] = useState(null); // 'local' ou 'viagem'
    const [numeroMarcador, setNumeroMarcador] = useState('');
    const [carrinho, setCarrinho] = useState([]);
    const [categoriaAtiva, setCategoriaAtiva] = useState(null);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [imagemAtiva, setImagemAtiva] = useState(0); // Para carousel de imagens
    const [enviando, setEnviando] = useState(false);
    const [pedidoCriado, setPedidoCriado] = useState(null);

    // Buscar categorias via autoatendimento
    const { data: categoriasData = [], isLoading: loadingCategorias } = useQuery({
        queryKey: ['categorias-auto'],
        queryFn: () => api.get('/autoatendimento/categorias').then(res => res.data),
    });

    // Buscar produtos disponíveis via autoatendimento
    const { data: produtosData = [], isLoading: loadingProdutos } = useQuery({
        queryKey: ['produtos-auto'],
        queryFn: () => api.get('/autoatendimento/produtos').then(res => res.data),
    });

    // Garantir que são arrays
    const categorias = Array.isArray(categoriasData) ? categoriasData : [];
    const produtos = Array.isArray(produtosData) ? produtosData : [];

    // Selecionar primeira categoria ao carregar
    useEffect(() => {
        if (categorias.length > 0 && !categoriaAtiva) {
            setCategoriaAtiva(categorias[0].id);
        }
    }, [categorias, categoriaAtiva]);

    // Resetar imagem ativa ao trocar de produto
    useEffect(() => {
        setImagemAtiva(0);
    }, [produtoSelecionado]);

    // Produtos da categoria ativa
    const produtosCategoria = produtos.filter(p => p.categoriaId === categoriaAtiva);

    // Total do carrinho
    const totalCarrinho = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const qtdItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);

    // Adicionar ao carrinho
    const adicionarAoCarrinho = (produto) => {
        setCarrinho(prev => {
            const existente = prev.find(item => item.id === produto.id);
            if (existente) {
                return prev.map(item =>
                    item.id === produto.id
                        ? { ...item, quantidade: item.quantidade + 1 }
                        : item
                );
            }
            return [...prev, { ...produto, quantidade: 1 }];
        });
    };

    // Remover do carrinho
    const removerDoCarrinho = (produtoId) => {
        setCarrinho(prev => {
            const existente = prev.find(item => item.id === produtoId);
            if (existente && existente.quantidade > 1) {
                return prev.map(item =>
                    item.id === produtoId
                        ? { ...item, quantidade: item.quantidade - 1 }
                        : item
                );
            }
            return prev.filter(item => item.id !== produtoId);
        });
    };

    // Ir para seleção de tipo
    const irParaTipo = () => {
        if (carrinho.length > 0) {
            setEtapa('tipo');
        }
    };

    // Selecionar tipo de atendimento
    const selecionarTipo = (tipo) => {
        setTipoAtendimento(tipo);
        if (tipo === 'viagem') {
            // Para viagem, finaliza direto
            finalizarPedido(tipo, null);
        } else {
            // Para local, pede o marcador
            setEtapa('marcador');
        }
    };

    // Confirmar marcador e finalizar
    const confirmarMarcador = () => {
        if (numeroMarcador.trim()) {
            finalizarPedido('local', numeroMarcador);
        }
    };

    // Finalizar pedido
    const finalizarPedido = async (tipo, marcador) => {
        if (carrinho.length === 0) return;

        setEnviando(true);
        try {
            const pedidoData = {
                tipoAtendimento: tipo,
                marcador: tipo === 'local' ? marcador : null,
                itens: carrinho.map(item => ({
                    produtoId: item.id,
                    quantidade: item.quantidade,
                    observacao: item.observacao || null,
                })),
                origem: 'autoatendimento',
            };

            const response = await api.post('/autoatendimento/pedido', pedidoData);
            setPedidoCriado(response.data);
            setEtapa('confirmado');

            // Emitir para Socket.IO
            getSocket().emit('novo_pedido_autoatendimento', response.data);
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            alert('Erro ao enviar pedido. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    };

    // Novo pedido
    const novoPedido = () => {
        setEtapa('cardapio');
        setTipoAtendimento(null);
        setNumeroMarcador('');
        setCarrinho([]);
        setPedidoCriado(null);
    };

    // ========================================
    // TELA TIPO - Escolher tipo APÓS carrinho
    // ========================================
    if (etapa === 'tipo') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex flex-col items-center justify-center p-8">
                <button
                    onClick={() => setEtapa('carrinho')}
                    className="absolute top-6 left-6 text-white text-xl"
                >
                    ← Voltar
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">🔥 ChapaTech</h1>
                    <p className="text-2xl text-white/90">Como deseja receber?</p>
                    <p className="text-lg text-white/70 mt-2">Total: R$ {totalCarrinho.toFixed(2)}</p>
                </div>

                <div className="flex gap-8">
                    <button
                        onClick={() => selecionarTipo('local')}
                        className="bg-white rounded-3xl p-12 shadow-2xl hover:scale-105 transition-transform flex flex-col items-center min-w-[200px]"
                    >
                        <span className="text-7xl mb-4">🍽️</span>
                        <span className="text-2xl font-bold text-gray-800">Comer Aqui</span>
                        <span className="text-sm text-gray-500 mt-2">Precisaremos do número da mesa</span>
                    </button>

                    <button
                        onClick={() => selecionarTipo('viagem')}
                        className="bg-white rounded-3xl p-12 shadow-2xl hover:scale-105 transition-transform flex flex-col items-center min-w-[200px]"
                    >
                        <span className="text-7xl mb-4">🛍️</span>
                        <span className="text-2xl font-bold text-gray-800">Para Viagem</span>
                        <span className="text-sm text-gray-500 mt-2">Retirar no balcão</span>
                    </button>
                </div>
            </div>
        );
    }

    // ========================================
    // TELA MARCADOR - Digitar número da mesa
    // ========================================
    if (etapa === 'marcador') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex flex-col items-center justify-center p-8">
                <button
                    onClick={() => setEtapa('tipo')}
                    className="absolute top-6 left-6 text-white text-xl"
                >
                    ← Voltar
                </button>

                <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Número da Mesa
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Digite o número do marcador da sua mesa:
                    </p>

                    <input
                        type="number"
                        value={numeroMarcador}
                        onChange={(e) => setNumeroMarcador(e.target.value)}
                        placeholder="Ex: 12"
                        className="w-full text-center text-5xl font-bold p-6 border-2 border-gray-300 rounded-2xl mb-8 focus:outline-none focus:border-orange-500"
                        autoFocus
                    />

                    <button
                        onClick={confirmarMarcador}
                        disabled={!numeroMarcador.trim() || enviando}
                        className="w-full bg-green-500 text-white text-xl font-bold py-4 rounded-2xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {enviando ? 'Enviando...' : 'Confirmar Pedido ✓'}
                    </button>

                    <p className="text-sm text-gray-500 mt-4">
                        Total: R$ {totalCarrinho.toFixed(2)}
                    </p>
                </div>
            </div>
        );
    }

    // ========================================
    // TELA CONFIRMADO - Pedido enviado
    // ========================================
    if (etapa === 'confirmado') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col items-center justify-center p-8">
                <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-md w-full text-center">
                    <span className="text-8xl mb-6 block">✅</span>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Pedido Enviado!
                    </h2>

                    {tipoAtendimento === 'local' && (
                        <p className="text-xl text-gray-600 mb-4">
                            Aguarde na mesa com o marcador <strong>#{numeroMarcador}</strong>
                        </p>
                    )}

                    {tipoAtendimento === 'viagem' && (
                        <p className="text-xl text-gray-600 mb-4">
                            Aguarde seu pedido no balcão
                        </p>
                    )}

                    <p className="text-2xl font-bold text-orange-500 mb-8">
                        Total: R$ {totalCarrinho.toFixed(2)}
                    </p>

                    <button
                        onClick={novoPedido}
                        className="w-full bg-green-500 text-white text-xl font-bold py-4 rounded-2xl hover:bg-green-600 transition-colors"
                    >
                        Novo Pedido
                    </button>
                </div>
            </div>
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
                        <span className="text-lg font-bold">R$ {totalCarrinho.toFixed(2)}</span>
                    </div>
                </button>
            )}

            {/* Main Content - Sidebar + Produtos */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Categorias */}
                <aside className="w-72 bg-white shadow-xl overflow-y-auto border-r border-gray-200">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            📋 Categorias
                        </h2>
                        <nav className="space-y-2">
                            {categorias.map((categoria) => {
                                const produtosCount = produtos.filter(p => p.categoriaId === categoria.id).length;
                                const isActive = categoriaAtiva === categoria.id;

                                return (
                                    <button
                                        key={categoria.id}
                                        onClick={() => setCategoriaAtiva(categoria.id)}
                                        className={`w-full text-left px-4 py-4 rounded-xl font-medium transition-all transform ${isActive
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-102'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg">{categoria.nome}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-200'
                                                }`}>
                                                {produtosCount}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>

                        {categorias.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                <p className="text-sm">Nenhuma categoria disponível</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Área de Produtos */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        {/* Header da categoria ativa */}
                        {categoriaAtiva && (
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-gray-800">
                                    {categorias.find(c => c.id === categoriaAtiva)?.nome}
                                </h2>
                                <p className="text-gray-500 mt-1">
                                    {produtosCategoria.length} {produtosCategoria.length === 1 ? 'produto' : 'produtos'}
                                </p>
                            </div>
                        )}

                        {/* Grid de Produtos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {produtosCategoria.map(produto => {
                                const itemCarrinho = carrinho.find(item => item.id === produto.id);
                                return (
                                    <div
                                        key={produto.id}
                                        className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow cursor-pointer group"
                                        onClick={() => setProdutoSelecionado(produto)}
                                    >
                                        {/* Imagem do produto */}
                                        <div className="h-40 relative overflow-hidden">
                                            {(() => {
                                                try {
                                                    const imagens = produto.imagens ? JSON.parse(produto.imagens) : [];
                                                    if (imagens.length > 0) {
                                                        return (
                                                            <img
                                                                src={imagens[0]}
                                                                alt={produto.nome}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                            />
                                                        );
                                                    }
                                                } catch (e) {
                                                    console.error('Erro ao parsear imagens:', e);
                                                }
                                                return (
                                                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                                        <span className="text-6xl group-hover:scale-110 transition-transform">🍔</span>
                                                    </div>
                                                );
                                            })()}
                                            {itemCarrinho && (
                                                <div className="absolute top-2 right-2 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                                    {itemCarrinho.quantidade}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-orange-500 transition-colors">
                                                {produto.nome}
                                            </h3>
                                            {produto.descricao && (
                                                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                                                    {produto.descricao}
                                                </p>
                                            )}
                                            <p className="text-orange-500 font-bold text-2xl mt-auto">
                                                R$ {Number(produto.preco).toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="p-4 pt-0" onClick={(e) => e.stopPropagation()}>
                                            {itemCarrinho ? (
                                                <div className="flex items-center justify-between bg-orange-100 rounded-xl p-3">
                                                    <button
                                                        onClick={() => removerDoCarrinho(produto.id)}
                                                        className="w-10 h-10 bg-orange-500 text-white rounded-full text-xl font-bold hover:bg-orange-600 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-2xl font-bold text-orange-600">
                                                        {itemCarrinho.quantidade}
                                                    </span>
                                                    <button
                                                        onClick={() => adicionarAoCarrinho(produto)}
                                                        className="w-10 h-10 bg-orange-500 text-white rounded-full text-xl font-bold hover:bg-orange-600 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => adicionarAoCarrinho(produto)}
                                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
                                                >
                                                    Adicionar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mensagem quando não há produtos */}
                        {produtosCategoria.length === 0 && categoriaAtiva && (
                            <div className="text-center py-20">
                                <div className="text-8xl mb-4">🍽️</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    Nenhum produto disponível
                                </h3>
                                <p className="text-gray-500">
                                    Não há produtos nesta categoria no momento
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal Carrinho */}
            {etapa === 'carrinho' && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                    <div className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Seu Pedido</h2>
                            <button
                                onClick={() => setEtapa('cardapio')}
                                className="text-gray-500 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {carrinho.map(item => (
                                <div key={item.id} className="flex items-center gap-4 py-4 border-b">
                                    <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <span className="text-3xl">🍔</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800">{item.nome}</h3>
                                        <p className="text-orange-500 font-bold">
                                            R$ {(item.preco * item.quantidade).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => removerDoCarrinho(item.id)}
                                            className="w-8 h-8 bg-gray-200 rounded-full text-lg font-bold"
                                        >
                                            -
                                        </button>
                                        <span className="font-bold text-lg w-6 text-center">
                                            {item.quantidade}
                                        </span>
                                        <button
                                            onClick={() => adicionarAoCarrinho(item)}
                                            className="w-8 h-8 bg-orange-500 text-white rounded-full text-lg font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t">
                            <div className="flex justify-between text-xl font-bold mb-4">
                                <span>Total:</span>
                                <span className="text-orange-500">R$ {totalCarrinho.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={irParaTipo}
                                disabled={carrinho.length === 0}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-bold text-xl disabled:opacity-50"
                            >
                                Continuar →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalhes do Produto */}
            {produtoSelecionado && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    onClick={() => setProdutoSelecionado(null)}
                >
                    <div
                        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Carousel de Imagens do Produto */}
                        <div className="h-64 relative overflow-hidden">
                            {(() => {
                                try {
                                    const imagens = produtoSelecionado.imagens ? JSON.parse(produtoSelecionado.imagens) : [];

                                    if (imagens.length === 0) {
                                        return (
                                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                                <span className="text-9xl">🍔</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <>
                                            {/* Imagem atual */}
                                            <img
                                                src={imagens[imagemAtiva]}
                                                alt={produtoSelecionado.nome}
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Botão fechar */}
                                            <button
                                                onClick={() => setProdutoSelecionado(null)}
                                                className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors shadow-lg z-10"
                                            >
                                                ✕
                                            </button>

                                            {/* Setas de navegação (se > 1 imagem) */}
                                            {imagens.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={() => setImagemAtiva((imagemAtiva - 1 + imagens.length) % imagens.length)}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
                                                    >
                                                        ←
                                                    </button>
                                                    <button
                                                        onClick={() => setImagemAtiva((imagemAtiva + 1) % imagens.length)}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
                                                    >
                                                        →
                                                    </button>
                                                </>
                                            )}

                                            {/* Indicadores (se > 1 imagem) */}
                                            {imagens.length > 1 && (
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                                    {imagens.map((_, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setImagemAtiva(idx)}
                                                            className={`w-2 h-2 rounded-full transition-all ${idx === imagemAtiva ? 'bg-white w-6' : 'bg-white/50'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    );
                                } catch (e) {
                                    console.error('Erro ao parsear imagens:', e);
                                    return (
                                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                            <span className="text-9xl">🍔</span>
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        {/* Informações do Produto */}
                        <div className="p-6">
                            {/* Cabeçalho */}
                            <div className="border-b pb-4 mb-4">
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                    {produtoSelecionado.nome}
                                </h2>
                                <p className="text-3xl font-bold text-orange-500">
                                    R$ {Number(produtoSelecionado.preco).toFixed(2)}
                                </p>
                            </div>

                            {/* Descrição */}
                            {produtoSelecionado.descricao && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                                        📝 Descrição
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {produtoSelecionado.descricao}
                                    </p>
                                </div>
                            )}

                            {/* Ingredientes/Composição */}
                            {produtoSelecionado.ingredientes && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        🥘 Ingredientes
                                    </h3>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {produtoSelecionado.ingredientes.split(',').map((ingrediente, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
                                                >
                                                    {ingrediente.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Informações Adicionais */}
                            {produtoSelecionado.categoria && (
                                <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                                    <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full font-medium">
                                        {produtoSelecionado.categoria.nome}
                                    </span>
                                </div>
                            )}

                            {/* Controles */}
                            <div className="border-t pt-4">
                                {(() => {
                                    const itemCarrinho = carrinho.find(item => item.id === produtoSelecionado.id);
                                    return itemCarrinho ? (
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 flex items-center justify-between bg-orange-100 rounded-xl p-4">
                                                <button
                                                    onClick={() => removerDoCarrinho(produtoSelecionado.id)}
                                                    className="w-12 h-12 bg-orange-500 text-white rounded-full text-2xl font-bold hover:bg-orange-600 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="text-3xl font-bold text-orange-600">
                                                    {itemCarrinho.quantidade}
                                                </span>
                                                <button
                                                    onClick={() => adicionarAoCarrinho(produtoSelecionado)}
                                                    className="w-12 h-12 bg-orange-500 text-white rounded-full text-2xl font-bold hover:bg-orange-600 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setProdutoSelecionado(null)}
                                                className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                                            >
                                                Fechar
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                adicionarAoCarrinho(produtoSelecionado);
                                                setProdutoSelecionado(null);
                                            }}
                                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
                                        >
                                            Adicionar ao Carrinho - R$ {Number(produtoSelecionado.preco).toFixed(2)}
                                        </button>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AutoAtendimento;
