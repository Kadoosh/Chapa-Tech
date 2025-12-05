import { useState } from 'react';
import { Modal } from '../common/Modal';
import { useClientePorTelefone, useCriarCliente } from '../../hooks/useClientes';
import { FeedbackModal } from '../common/FeedbackModal';

export function ClienteModal({ isOpen, onClose, onSelectCliente }) {
  const [telefone, setTelefone] = useState('');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState({ open: false, type: 'error', title: '', message: '' });

  const { data: clienteExistente, isLoading: buscandoCliente } = useClientePorTelefone(telefone);
  const criarCliente = useCriarCliente();

  const handleBuscar = () => {
    if (clienteExistente?.data) {
      onSelectCliente(clienteExistente.data);
      onClose();
    }
  };

  const handleCriar = async (e) => {
    e.preventDefault();
    try {
      const novoCliente = await criarCliente.mutateAsync({
        nome,
        sobrenome,
        telefone,
        email: email || undefined,
      });
      onSelectCliente(novoCliente.data);
      onClose();
    } catch (error) {
      setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
    }
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar/Cadastrar Cliente">
      <div className="space-y-4">
        {/* Buscar por telefone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              placeholder="(62) 99999-9999"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={handleBuscar}
              disabled={buscandoCliente || telefone.length < 14}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {buscandoCliente ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Cliente encontrado */}
        {clienteExistente?.data && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="font-medium text-green-800">Cliente encontrado!</p>
            <p className="text-sm text-green-700">
              {clienteExistente.data.nome} {clienteExistente.data.sobrenome}
            </p>
          </div>
        )}

        {/* Formulário de novo cliente */}
        {telefone.length >= 14 && !clienteExistente?.data && (
          <form onSubmit={handleCriar} className="space-y-3 border-t pt-4">
            <h4 className="font-medium text-gray-900">Cadastrar Novo Cliente</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sobrenome *
              </label>
              <input
                type="text"
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={criarCliente.isPending}
              className="w-full bg-secondary-600 text-white py-2 rounded-lg hover:bg-secondary-700 disabled:opacity-50"
            >
              {criarCliente.isPending ? 'Cadastrando...' : 'Cadastrar Cliente'}
            </button>
          </form>
        )}

        {/* Botão para continuar sem cliente */}
        <button
          onClick={() => {
            onSelectCliente(null);
            onClose();
          }}
          className="w-full text-gray-600 text-sm hover:text-gray-800"
        >
          Continuar sem cliente
        </button>

        {/* Modal de Feedback */}
        <FeedbackModal
          isOpen={feedback.open}
          onClose={() => setFeedback({ ...feedback, open: false })}
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
        />
      </div>
    </Modal>
  );
}
