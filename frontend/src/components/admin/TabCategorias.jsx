import { useState } from 'react';
import { useCategorias } from '../../hooks/useProdutos';
import { useAdmin } from '../../hooks/useAdmin';
import { Modal } from '../common/Modal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export function TabCategorias() {
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, nome: '' });

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
      alert('Categoria excluída com sucesso!');
    } catch (error) {
      alert('Erro ao excluir: ' + (error.response?.data?.message || error.message));
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
            className="bg-white rounded-lg shadow p-6 border-2 border-gray-200 hover:border-primary-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{categoria.nome}</h3>
                {categoria.descricao && (
                  <p className="text-sm text-gray-600 mt-1">{categoria.descricao}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
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
            alert('Categoria salva com sucesso!');
          } catch (error) {
            alert('Erro ao salvar: ' + (error.response?.data?.message || error.message));
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
    </div>
  );
}

// Modal de Formulário
function CategoriaFormModal({ isOpen, onClose, categoria, onSave }) {
  const [form, setForm] = useState({
    nome: categoria?.nome || '',
    descricao: categoria?.descricao || '',
  });

  useState(() => {
    if (categoria) {
      setForm({
        nome: categoria.nome || '',
        descricao: categoria.descricao || '',
      });
    } else {
      setForm({ nome: '', descricao: '' });
    }
  }, [categoria]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoria ? 'Editar Categoria' : 'Nova Categoria'}
      size="sm"
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
          <textarea
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
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
