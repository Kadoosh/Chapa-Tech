export function FeedbackModal({ isOpen, onClose, type = 'success', title, message }) {
  if (!isOpen) return null;

  const config = {
    success: {
      icon: '✅',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const { icon, bgColor, borderColor, textColor, buttonColor } = config[type] || config.info;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative ${bgColor} border ${borderColor} rounded-lg shadow-xl max-w-sm w-full p-6 text-center`}>
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
      </div>
    </div>
  );
}
