import { useState } from 'react';
import { useMesas } from '../../hooks/useMesas';
import { useAdmin } from '../../hooks/useAdmin';
import { Modal } from '../common/Modal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export function TabMesas() {
  const [modalAberto, setModalAberto] = useState(false);
  const [mesaEditando, setMesaEditando] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, nome: '' });

  const { data: mesasData } = useMesas();
  const { criarMesa, atualizarMesa, deletarMesa } = useAdmin();

  const mesas = mesasData?.data || [];

  const handleNovo = () => {
    setMesaEditando(null);
    setModalAberto(true);
  };

  const handleEditar = (mesa) => {
    setMesaEditando(mesa);
    setModalAberto(true);
  };

  const handleDeletar = (mesa) => {
    setDeleteModal({ open: true, id: mesa.id, nome: `Mesa ${mesa.numero}` });
  };

  const confirmarDelete = async () => {
    try {
      await deletarMesa.mutateAsync(deleteModal.id);
      setDeleteModal({ open: false, id: null, nome: '' });
      alert('Mesa excluída com sucesso!');
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
          + Nova Mesa
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {mesas.map((mesa) => (
          <div
            key={mesa.id}
            className={`relative aspect-square rounded-lg shadow p-4 border-2 flex flex-col items-center justify-center ${
              mesa.status === 'livre'
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="text-3xl font-bold text-gray-900 mb-2">{mesa.numero}</div>
            <div className="text-xs text-gray-600 capitalize mb-3">{mesa.status}</div>

            <div className="absolute bottom-2 left-2 right-2 flex gap-1">
              <button
                onClick={() => handleEditar(mesa)}
                className="flex-1 px-2 py-1 text-xs text-primary-600 bg-white border border-primary-600 rounded hover:bg-primary-50"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeletar(mesa)}
                className="flex-1 px-2 py-1 text-xs text-red-600 bg-white border border-red-600 rounded hover:bg-red-50"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Form */}
      <MesaFormModal
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setMesaEditando(null);
        }}
        mesa={mesaEditando}
        onSave={async (dados) => {
          try {
            if (mesaEditando) {
              await atualizarMesa.mutateAsync({ id: mesaEditando.id, dados });
            } else {
              await criarMesa.mutateAsync(dados);
            }
            setModalAberto(false);
            setMesaEditando(null);
            alert('Mesa salva com sucesso!');
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
        isLoading={deletarMesa.isPending}
      />
    </div>
  );
}

// Modal de Formulário
function MesaFormModal({ isOpen, onClose, mesa, onSave }) {
  const [form, setForm] = useState({
    numero: mesa?.numero || '',
    capacidade: mesa?.capacidade || '',
  });

  useState(() => {
    if (mesa) {
      setForm({
        numero: mesa.numero || '',
        capacidade: mesa.capacidade || '',
      });
    } else {
      setForm({ numero: '', capacidade: '' });
    }
  }, [mesa]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      numero: parseInt(form.numero),
      capacidade: parseInt(form.capacidade),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mesa ? 'Editar Mesa' : 'Nova Mesa'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número da Mesa *
          </label>
          <input
            type="number"
            required
            min="1"
            value={form.numero}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacidade (pessoas) *
          </label>
          <input
            type="number"
            required
            min="1"
            value={form.capacidade}
            onChange={(e) => setForm({ ...form, capacidade: e.target.value })}
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
