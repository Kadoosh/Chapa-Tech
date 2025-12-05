import { Modal } from '../common/Modal';

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, isLoading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Exclusão" size="sm">
      <div className="space-y-4">
        <p className="text-gray-700">
          Tem certeza que deseja excluir <strong>{itemName}</strong>?
        </p>
        <p className="text-sm text-red-600">
          ⚠️ Esta ação não pode ser desfeita.
        </p>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
