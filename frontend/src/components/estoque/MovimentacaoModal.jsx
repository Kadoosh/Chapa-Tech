import { useState, useEffect } from 'react';
import { FeedbackModal } from '../common/FeedbackModal';

export function MovimentacaoModal({ isOpen, onClose, onSubmit, tipo, produto, loading }) {
  const [formData, setFormData] = useState({
    quantidade: '',
    observacao: '',
    fornecedor: '',
    numeroNota: '',
  });
  const [feedback, setFeedback] = useState({ open: false, type: 'warning', title: '', message: '' });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        quantidade: '',
        observacao: '',
        fornecedor: '',
        numeroNota: '',
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.quantidade || parseInt(formData.quantidade) <= 0) {
      setFeedback({ open: true, type: 'warning', title: 'Atenção!', message: 'Quantidade deve ser maior que zero' });
      return;
    }

    onSubmit({
      produtoId: produto.id,
      tipo,
      quantidade: parseInt(formData.quantidade),
      observacao: formData.observacao || null,
      fornecedor: formData.fornecedor || null,
      numeroNota: formData.numeroNota || null,
    });
  };

  if (!isOpen) return null;

  const isEntrada = tipo === 'entrada';
  const corTema = isEntrada ? 'green' : 'red';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className={`bg-${corTema}-600 text-white p-4`}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            {isEntrada ? '📥' : '📤'}
            {isEntrada ? 'Registrar Entrada' : 'Registrar Saída'}
          </h2>
          <p className="text-sm opacity-90 mt-1">
            {produto?.nome}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Estoque Atual */}
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Estoque atual</p>
            <p className="text-2xl font-bold text-gray-900">
              {produto?.quantidadeEstoque || 0}
            </p>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Digite a quantidade"
              required
            />
          </div>

          {/* Campos específicos de entrada */}
          {isEntrada && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fornecedor
                </label>
                <input
                  type="text"
                  name="fornecedor"
                  value={formData.fornecedor}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nº da Nota Fiscal
                </label>
                <input
                  type="text"
                  name="numeroNota"
                  value={formData.numeroNota}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Número da nota"
                />
              </div>
            </>
          )}

          {/* Observação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observação
            </label>
            <textarea
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={isEntrada ? 'Ex: Reposição semanal' : 'Ex: Produto vencido'}
            />
          </div>

          {/* Preview do resultado */}
          <div className={`bg-${corTema}-50 rounded-lg p-3 text-center`}>
            <p className="text-sm text-gray-600">Estoque após {isEntrada ? 'entrada' : 'saída'}</p>
            <p className={`text-2xl font-bold text-${corTema}-600`}>
              {isEntrada 
                ? (produto?.quantidadeEstoque || 0) + (parseInt(formData.quantidade) || 0)
                : Math.max(0, (produto?.quantidadeEstoque || 0) - (parseInt(formData.quantidade) || 0))
              }
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`
                flex-1 px-4 py-3 text-white rounded-lg transition-colors
                ${isEntrada 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
                }
                disabled:opacity-50
              `}
            >
              {loading ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>

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
