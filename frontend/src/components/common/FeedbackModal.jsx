import { Modal } from './Modal';

/**
 * Modal de feedback para exibir mensagens de sucesso, erro, warning e info
 * Agora usa o componente Modal base para reutilização
 */
export function FeedbackModal({ isOpen, onClose, type = 'success', title, message }) {
  const config = {
    success: {
      icon: '✅',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const { icon, bgColor, textColor, buttonColor } = config[type] || config.info;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className={`${bgColor} -m-4 p-6 text-center rounded-b-lg`}>
        {/* Ícone */}
        <div className="text-5xl mb-4">{icon}</div>

        {/* Título */}
        {title && (
          <h3 className={`text-lg font-semibold ${textColor} mb-2`}>{title}</h3>
        )}

        {/* Mensagem */}
        <p className={`${textColor} mb-6`}>{message}</p>

        {/* Botão */}
        <button
          onClick={onClose}
          className={`px-6 py-2 ${buttonColor} text-white rounded-lg font-medium transition-colors`}
        >
          OK
        </button>
      </div>
    </Modal>
  );
}
