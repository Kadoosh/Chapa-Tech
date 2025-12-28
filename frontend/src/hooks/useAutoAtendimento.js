import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { getSocket } from '../services/socket';

/**
 * Hook para gerenciar toda lógica do AutoAtendimento
 * Centraliza estados, queries e funções do carrinho/pedido
 */
export function useAutoAtendimento() {
    // Estados do fluxo
    const [etapa, setEtapa] = useState('cardapio'); // cardapio, carrinho, tipo, marcador, confirmado
    const [tipoAtendimento, setTipoAtendimento] = useState(null); // 'local' ou 'viagem'
    const [numeroMarcador, setNumeroMarcador] = useState('');
    const [carrinho, setCarrinho] = useState([]);
    const [categoriaAtiva, setCategoriaAtiva] = useState(null);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [imagemAtiva, setImagemAtiva] = useState(0);
    const [enviando, setEnviando] = useState(false);
    const [pedidoCriado, setPedidoCriado] = useState(null);

    // Queries
    const { data: categoriasData = [], isLoading: loadingCategorias } = useQuery({
        queryKey: ['categorias-auto'],
        queryFn: () => api.get('/autoatendimento/categorias').then(res => res.data),
    });

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

    // === FUNÇÕES DO CARRINHO ===

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

    // === FUNÇÕES DE NAVEGAÇÃO ===

    const irParaTipo = () => {
        if (carrinho.length > 0) {
            setEtapa('tipo');
        }
    };

    const selecionarTipo = (tipo) => {
        setTipoAtendimento(tipo);
        if (tipo === 'viagem') {
            finalizarPedido(tipo, null);
        } else {
            setEtapa('marcador');
        }
    };

    const confirmarMarcador = () => {
        if (numeroMarcador.trim()) {
            finalizarPedido('local', numeroMarcador);
        }
    };

    // === FINALIZAÇÃO ===

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

    const novoPedido = () => {
        setEtapa('cardapio');
        setTipoAtendimento(null);
        setNumeroMarcador('');
        setCarrinho([]);
        setPedidoCriado(null);
    };

    return {
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
        imagemAtiva,
        setImagemAtiva,
        enviando,
        pedidoCriado,

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
    };
}
