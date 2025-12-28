import autoatendimentoService from '../services/autoatendimento.service.js';

/**
 * Controller do Auto Atendimento
 */
const autoatendimentoController = {
    /**
     * Lista categorias para auto atendimento
     */
    listarCategorias: async (req, res) => {
        const categorias = await autoatendimentoService.listarCategorias();
        res.json(categorias);
    },

    /**
     * Lista produtos para auto atendimento
     */
    listarProdutos: async (req, res) => {
        const produtos = await autoatendimentoService.listarProdutos();
        res.json(produtos);
    },

    /**
     * Cria pedido do auto atendimento
     */
    criarPedido: async (req, res) => {
        const { tipoAtendimento, marcador, itens } = req.body;
        const io = req.app.get('io');

        const pedido = await autoatendimentoService.criarPedido(
            { tipoAtendimento, marcador, itens },
            io
        );

        res.status(201).json({
            success: true,
            message: 'Pedido criado com sucesso',
            data: pedido,
        });
    },
};

export default autoatendimentoController;
