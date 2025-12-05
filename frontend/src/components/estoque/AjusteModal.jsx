import { useState, useEffect } from 'react';
import { FeedbackModal } from '../common/FeedbackModal';

export function AjusteModal({ isOpen, onClose, onSubmit, produto, loading }) {
  const [formData, setFormData] = useState({
    quantidade: '',
    motivo: '',
  });
  const [feedback, setFeedback] = useState({ open: false, type: 'warning', title: '', message: '' });

  useEffect(() => {
    if (isOpen && produto) {
      setFormData({
        quantidade: produto.quantidadeEstoque?.toString() || '0',
        motivo: '',
      });
    }
  }, [isOpen, produto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const novaQuantidade = parseInt(formData.quantidade);
    if (isNaN(novaQuantidade) || novaQuantidade < 0) {
      setFeedback({ open: true, type: 'warning', title: 'Atenção!', message: 'Quantidade inválida' });
      return;
    }

    if (!formData.motivo.trim()) {
      setFeedback({ open: true, type: 'warning', title: 'Atenção!', message: 'Informe o motivo do ajuste' });
      return;
    }

    onSubmit({
      produtoId: produto.id,
      quantidade: novaQuantidade,
      motivo: formData.motivo,
    });
  };

  if (!isOpen) return null;

  const diferenca = parseInt(formData.quantidade || 0) - (produto?.quantidadeEstoque || 0);

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
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            ⚙️ Ajuste de Estoque
          </h2>
          <p className="text-sm opacity-90 mt-1">
            {produto?.nome}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Estoque Atual */}
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Estoque atual no sistema</p>
            <p className="text-2xl font-bold text-gray-900">
              {produto?.quantidadeEstoque || 0}
            </p>
          </div>

          {/* Nova Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade Real <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Quantidade encontrada no inventário"
              required
            />
          </div>

          {/* Diferença */}
          {diferenca !== 0 && (
            <div className={`
              rounded-lg p-3 text-center
              ${diferenca > 0 ? 'bg-green-50' : 'bg-red-50'}
            `}>
              <p className="text-sm text-gray-600">Diferença</p>
              <p className={`text-xl font-bold ${diferenca > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {diferenca > 0 ? '+' : ''}{diferenca}
              </p>
            </div>
          )}

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo do Ajuste <span className="text-red-500">*</span>
            </label>
            <select
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
            >
              <option value="">Selecione um motivo</option>
              <option value="Inventário físico">Inventário físico</option>
              <option value="Produto vencido">Produto vencido</option>
              <option value="Produto danificado">Produto danificado</option>
              <option value="Erro de contagem anterior">Erro de contagem anterior</option>
              <option value="Perda/Extravio">Perda/Extravio</option>
              <option value="Bonificação">Bonificação</option>
              <option value="Outro">Outro</option>
            </select>
            {formData.motivo === 'Outro' && (
              <textarea
                name="motivo"
                value={formData.motivo === 'Outro' ? '' : formData.motivo}
                onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                rows="2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva o motivo..."
              />
            )}
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
              disabled={loading || diferenca === 0}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Confirmar Ajuste'}
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
