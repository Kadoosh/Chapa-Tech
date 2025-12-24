import { useState, useEffect } from 'react';
import { useAcompanhamentos } from '../../hooks/useAcompanhamentos';
import { useAdmin } from '../../hooks/useAdmin';
import { Modal } from '../common/Modal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { FeedbackModal } from '../common/FeedbackModal';

export function TabAcompanhamentos() {
    const [modalAberto, setModalAberto] = useState(false);
    const [acompanhamentoEditando, setAcompanhamentoEditando] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, nome: '' });
    const [feedback, setFeedback] = useState({ open: false, type: 'success', title: '', message: '' });

    const { data: acompanhamentos, isLoading } = useAcompanhamentos();
    const { criarAcompanhamento, atualizarAcompanhamento, deletarAcompanhamento } = useAdmin();

    const handleNovo = () => {
        setAcompanhamentoEditando(null);
        setModalAberto(true);
    };

    const handleEditar = (acompanhamento) => {
        setAcompanhamentoEditando(acompanhamento);
        setModalAberto(true);
    };

    const handleDeletar = (acompanhamento) => {
        setDeleteModal({ open: true, id: acompanhamento.id, nome: acompanhamento.nome });
    };

    const confirmarDelete = async () => {
        try {
            await deletarAcompanhamento.mutateAsync(deleteModal.id);
            setDeleteModal({ open: false, id: null, nome: '' });
            setFeedback({ open: true, type: 'success', title: 'Sucesso!', message: 'Acompanhamento excluído com sucesso!' });
        } catch (error) {
            setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
        }
    };

    const formatarValor = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(valor);
    };

    if (isLoading) {
        return <div className="p-4 text-center">Carregando...</div>;
    }

    const listaAcompanhamentos = acompanhamentos || [];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Acompanhamentos</h2>
                <button
                    onClick={handleNovo}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                >
                    + Novo Acompanhamento
                </button>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Nome
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Descrição
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Valor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {listaAcompanhamentos.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {item.nome}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {item.descricao || '-'}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                    {formatarValor(item.valor)}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${item.disponivel
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {item.disponivel ? 'Disponível' : 'Indisponível'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-sm space-x-2">
                                    <button
                                        onClick={async () => {
                                            try {
                                                await atualizarAcompanhamento.mutateAsync({
                                                    id: item.id,
                                                    dados: { disponivel: !item.disponivel }
                                                });
                                            } catch (error) {
                                                setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
                                            }
                                        }}
                                        className={`${item.disponivel ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                                    >
                                        {item.disponivel ? 'Desativar' : 'Ativar'}
                                    </button>
                                    <button
                                        onClick={() => handleEditar(item)}
                                        className="text-primary-600 hover:text-primary-900"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeletar(item)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {listaAcompanhamentos.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    Nenhum acompanhamento cadastrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Form */}
            <AcompanhamentoFormModal
                isOpen={modalAberto}
                onClose={() => {
                    setModalAberto(false);
                    setAcompanhamentoEditando(null);
                }}
                acompanhamento={acompanhamentoEditando}
                onSave={async (dados) => {
                    try {
                        if (acompanhamentoEditando) {
                            await atualizarAcompanhamento.mutateAsync({ id: acompanhamentoEditando.id, dados });
                        } else {
                            await criarAcompanhamento.mutateAsync(dados);
                        }
                        setModalAberto(false);
                        setAcompanhamentoEditando(null);
                        setFeedback({ open: true, type: 'success', title: 'Sucesso!', message: 'Acompanhamento salvo com sucesso!' });
                    } catch (error) {
                        setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
                    }
                }}
                isLoading={criarAcompanhamento.isPending || atualizarAcompanhamento.isPending}
            />

            {/* Modal de Delete */}
            <DeleteConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null, nome: '' })}
                onConfirm={confirmarDelete}
                itemName={deleteModal.nome}
                isLoading={deletarAcompanhamento.isPending}
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

// Modal de Formulário
function AcompanhamentoFormModal({ isOpen, onClose, acompanhamento, onSave, isLoading }) {
    const [form, setForm] = useState({
        nome: '',
        descricao: '',
        valor: '',
        disponivel: true,
    });

    // Resetar formulário
    useEffect(() => {
        if (isOpen) {
            if (acompanhamento) {
                setForm({
                    nome: acompanhamento.nome,
                    descricao: acompanhamento.descricao || '',
                    valor: acompanhamento.valor,
                    disponivel: acompanhamento.disponivel,
                });
            } else {
                setForm({
                    nome: '',
                    descricao: '',
                    valor: '',
                    disponivel: true,
                });
            }
        }
    }, [isOpen, acompanhamento]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            valor: parseFloat(form.valor),
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={acompanhamento ? 'Editar Acompanhamento' : 'Novo Acompanhamento'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome *
                    </label>
                    <input
                        type="text"
                        required
                        value={form.nome}
                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                    </label>
                    <input
                        type="text"
                        value={form.descricao}
                        onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor *
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        value={form.valor}
                        onChange={(e) => setForm({ ...form, valor: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="acompanhamento-disponivel"
                        checked={form.disponivel}
                        onChange={(e) => setForm({ ...form, disponivel: e.target.checked })}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="acompanhamento-disponivel" className="text-sm font-medium text-gray-700">
                        Disponível
                    </label>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
