import { useState, useEffect } from 'react';
import { useCategorias } from '../../hooks/useProdutos';
import { useAcompanhamentos } from '../../hooks/useAcompanhamentos';
import { useAdmin } from '../../hooks/useAdmin';
import { Modal } from '../common/Modal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { FeedbackModal } from '../common/FeedbackModal';

export function TabCategorias() {
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, nome: '' });
  const [feedback, setFeedback] = useState({ open: false, type: 'success', title: '', message: '' });

  const { data: categoriasData } = useCategorias();
  const { criarCategoria, atualizarCategoria, deletarCategoria } = useAdmin();

  const categorias = categoriasData?.data || [];

  const handleNovo = () => {
    setCategoriaEditando(null);
    setModalAberto(true);
  };

  const handleEditar = (categoria) => {
    setCategoriaEditando(categoria);
    setModalAberto(true);
  };

  const handleDeletar = (categoria) => {
    setDeleteModal({ open: true, id: categoria.id, nome: categoria.nome });
  };

  const confirmarDelete = async () => {
    try {
      await deletarCategoria.mutateAsync(deleteModal.id);
      setDeleteModal({ open: false, id: null, nome: '' });
      setFeedback({ open: true, type: 'success', title: 'Sucesso!', message: 'Categoria excluída com sucesso!' });
    } catch (error) {
      setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-end">
        <button
          onClick={handleNovo}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
        >
          + Nova Categoria
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className={`bg-white rounded-lg shadow p-6 border-2 ${categoria.ativa ? 'border-gray-200 hover:border-primary-300' : 'border-red-200 opacity-60'} transition-colors`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">{categoria.nome}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${categoria.ativa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {categoria.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                {categoria.descricao && (
                  <p className="text-sm text-gray-600 mt-1">{categoria.descricao}</p>
                )}
                {categoria.acompanhamentos && categoria.acompanhamentos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {categoria.acompanhamentos.slice(0, 3).map((acomp) => (
                      <span key={acomp.id} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
                        {acomp.nome}
                      </span>
                    ))}
                    {categoria.acompanhamentos.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{categoria.acompanhamentos.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={async () => {
                  try {
                    await atualizarCategoria.mutateAsync({
                      id: categoria.id,
                      dados: { ativa: !categoria.ativa }
                    });
                  } catch (error) {
                    setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
                  }
                }}
                className={`flex-1 px-3 py-2 text-sm border rounded-lg ${categoria.ativa ? 'text-yellow-600 border-yellow-600 hover:bg-yellow-50' : 'text-green-600 border-green-600 hover:bg-green-50'}`}
              >
                {categoria.ativa ? 'Desativar' : 'Ativar'}
              </button>
              <button
                onClick={() => handleEditar(categoria)}
                className="flex-1 px-3 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeletar(categoria)}
                className="flex-1 px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Form */}
      <CategoriaFormModal
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setCategoriaEditando(null);
        }}
        categoria={categoriaEditando}
        onSave={async (dados) => {
          try {
            if (categoriaEditando) {
              await atualizarCategoria.mutateAsync({ id: categoriaEditando.id, dados });
            } else {
              await criarCategoria.mutateAsync(dados);
            }
            setModalAberto(false);
            setCategoriaEditando(null);
            setFeedback({ open: true, type: 'success', title: 'Sucesso!', message: 'Categoria salva com sucesso!' });
          } catch (error) {
            setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
          }
        }}
      />

      {/* Modal de Delete */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, nome: '' })}
        onConfirm={confirmarDelete}
        itemName={deleteModal.nome}
        isLoading={deletarCategoria.isPending}
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
function CategoriaFormModal({ isOpen, onClose, categoria, onSave }) {
  const { data: acompanhamentosData, isLoading: carregandoAcompanhamentos } = useAcompanhamentos();
  const acompanhamentosDisponiveis = acompanhamentosData || [];

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    acompanhamentoIds: [],
  });

  useEffect(() => {
    if (categoria) {
      setForm({
        nome: categoria.nome || '',
        descricao: categoria.descricao || '',
        acompanhamentoIds: categoria.acompanhamentos?.map((a) => a.id) || [],
      });
    } else {
      setForm({ nome: '', descricao: '', acompanhamentoIds: [] });
    }
  }, [categoria, isOpen]);

  const toggleAcompanhamento = (id) => {
    setForm((prev) => ({
      ...prev,
      acompanhamentoIds: prev.acompanhamentoIds.includes(id)
        ? prev.acompanhamentoIds.filter((aId) => aId !== id)
        : [...prev.acompanhamentoIds, id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoria ? 'Editar Categoria' : 'Nova Categoria'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <textarea
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Seção de Acompanhamentos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Acompanhamentos para esta Categoria
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Selecione os acompanhamentos que poderão ser adicionados aos produtos desta categoria.
          </p>

          {carregandoAcompanhamentos ? (
            <div className="text-center py-4 text-gray-500">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary-600 border-r-transparent"></div>
              <span className="ml-2">Carregando...</span>
            </div>
          ) : acompanhamentosDisponiveis.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
              <span className="text-2xl mb-2 block">📦</span>
              <p className="text-sm">Nenhum acompanhamento cadastrado.</p>
              <p className="text-xs mt-1">Cadastre acompanhamentos na aba "Acompanhamentos" primeiro.</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {acompanhamentosDisponiveis.map((acomp) => {
                const isSelected = form.acompanhamentoIds.includes(acomp.id);
                return (
                  <label
                    key={acomp.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${isSelected
                        ? 'bg-primary-100 border-2 border-primary-500'
                        : 'bg-white border-2 border-gray-200 hover:border-primary-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAcompanhamento(acomp.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div>
                        <span className={`font-medium ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                          {acomp.nome}
                        </span>
                        {acomp.descricao && (
                          <p className="text-xs text-gray-500">{acomp.descricao}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${isSelected ? 'text-primary-600' : 'text-gray-600'}`}>
                      {formatarPreco(acomp.valor)}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {form.acompanhamentoIds.length > 0 && (
            <p className="text-xs text-primary-600 mt-2 font-medium">
              ✓ {form.acompanhamentoIds.length} acompanhamento(s) selecionado(s)
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}

