import prisma from '../config/database.js';

export const listar = async (req, res) => {
    try {
        const acompanhamentos = await prisma.acompanhamento.findMany({
            orderBy: { nome: 'asc' }
        });
        res.json(acompanhamentos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar acompanhamentos' });
    }
};

export const criar = async (req, res) => {
    try {
        const { nome, descricao, valor } = req.body;

        if (!nome || valor === undefined) {
            return res.status(400).json({ error: 'Nome e valor são obrigatórios' });
        }

        const acompanhamento = await prisma.acompanhamento.create({
            data: {
                nome,
                descricao,
                valor: parseFloat(valor)
            }
        });

        res.status(201).json(acompanhamento);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar acompanhamento' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, valor, disponivel } = req.body;

        const acompanhamento = await prisma.acompanhamento.update({
            where: { id: parseInt(id) },
            data: {
                nome,
                descricao,
                valor: valor !== undefined ? parseFloat(valor) : undefined,
                disponivel
            }
        });

        res.json(acompanhamento);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar acompanhamento' });
    }
};

export const remover = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.acompanhamento.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Acompanhamento removido com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover acompanhamento' });
    }
};
