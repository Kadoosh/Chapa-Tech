import { useState } from 'react';
import { useCriarPedido } from './usePedidos';

/**
 * Hook para gerenciar o carrinho do atendente
 * Centraliza toda a lógica de carrinho, pedido e estados relacionados
 */
export function useCarrinhoAtendente() {
    // Estados do carrinho
    const [carrinho, setCarrinho] = useState([]);
    const [mesaSelecionada, setMesaSelecionada] = useState(null);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [paraViagem, setParaViagem] = useState(false);
    const [observacaoGeral, setObservacaoGeral] = useState('');
    const [carrinhoAberto, setCarrinhoAberto] = useState(false);

    // Mutation para criar pedido
    const criarPedido = useCriarPedido();

    /**
     * Adiciona produto ao carrinho
     * Suporta acompanhamentos opcionais
     */
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

    /**
     * Atualiza quantidade de um item
     */
    const atualizarQuantidade = (itemId, novaQuantidade) => {
        if (novaQuantidade < 1) return;
        setCarrinho(
            carrinho.map((item) =>
                item.itemId === itemId ? { ...item, quantidade: novaQuantidade } : item
            )
        );
    };

    /**
     * Remove item do carrinho
     */
    const removerItem = (itemId) => {
        setCarrinho(carrinho.filter((item) => item.itemId !== itemId));
    };

    /**
     * Atualiza observação de um item
     */
    const atualizarObservacao = (itemId, observacao) => {
        setCarrinho(
            carrinho.map((item) =>
                item.itemId === itemId ? { ...item, observacao } : item
            )
        );
    };

    /**
     * Limpa todo o carrinho e estados relacionados
     */
    const limparCarrinho = () => {
        setCarrinho([]);
        setMesaSelecionada(null);
        setClienteSelecionado(null);
        setParaViagem(false);
        setObservacaoGeral('');
    };

    /**
     * Monta e envia o pedido para a API
     * @returns {Promise<{success: boolean, message: string}>}
     */
    const finalizarPedido = async () => {
        // Validações
        if (!paraViagem && !mesaSelecionada) {
            return { success: false, message: 'Selecione uma mesa ou marque "Para Viagem"!' };
        }

        if (carrinho.length === 0) {
            return { success: false, message: 'Adicione produtos ao carrinho!' };
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

            return { success: true, message: 'Pedido enviado para a cozinha! 🍽️' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message
            };
        }
    };

    return {
        // Estados
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

        // Loading
        isLoading: criarPedido.isPending,

        // Funções
        adicionarProdutoAoCarrinho,
        atualizarQuantidade,
        removerItem,
        atualizarObservacao,
        limparCarrinho,
        finalizarPedido,
    };
}
