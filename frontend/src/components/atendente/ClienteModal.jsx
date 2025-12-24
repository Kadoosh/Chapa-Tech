import { useState } from 'react';
import { Modal } from '../common/Modal';
import { useCriarCliente, useClientes } from '../../hooks/useClientes';
import { FeedbackModal } from '../common/FeedbackModal';

export function ClienteModal({ isOpen, onClose, onSelectCliente }) {
  const [modo, setModo] = useState('rapido'); // 'rapido', 'buscar' ou 'cadastrar'
  const [busca, setBusca] = useState('');
  const [nomeRapido, setNomeRapido] = useState('');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [feedback, setFeedback] = useState({ open: false, type: 'error', title: '', message: '' });

  const { data: clientes } = useClientes({ busca: busca || undefined });
  const criarCliente = useCriarCliente();

  const handleSelecionarCliente = (cliente) => {
    onSelectCliente(cliente);
    limparForm();
    onClose();
  };

  // Pedido rápido - só passa o nome (NÃO cadastra cliente)
  const handlePedidoRapido = (e) => {
    e.preventDefault();
    // Passa um objeto simples com só o nome (não é um cliente cadastrado)
    onSelectCliente({
      nome: nomeRapido.trim(),
      isTemporario: true // Flag para indicar que não é cliente cadastrado
    });
    limparForm();
    onClose();
  };

  // Cadastro completo - cria cliente no banco
  const handleCadastrar = async (e) => {
    e.preventDefault();
    try {
      const novoCliente = await criarCliente.mutateAsync({
        nome,
        sobrenome,
        telefone,
      });
      onSelectCliente(novoCliente.data);
      limparForm();
      onClose();
    } catch (error) {
      setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
    }
  };

  const limparForm = () => {
    setNomeRapido('');
    setNome('');
    setSobrenome('');
    setTelefone('');
    setBusca('');
    setModo('rapido');
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // Capitaliza primeira letra de cada palavra
  const capitalize = (valor) => {
    return valor
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Filtrar clientes pela busca
  const clientesFiltrados = clientes?.data?.filter(c =>
    busca.length >= 2 && (
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (c.sobrenome && c.sobrenome.toLowerCase().includes(busca.toLowerCase())) ||
      (c.telefone && c.telefone.includes(busca))
    )
  ) || [];

  return (
    <Modal isOpen={isOpen} onClose={() => { limparForm(); onClose(); }} title="Cliente" mobilePosition="top">
      <div className="space-y-4">
        {/* Abas */}
        <div className="flex gap-1 border-b pb-2">
          <button
            onClick={() => setModo('rapido')}
            className={`px-3 py-2 rounded-t-lg text-sm ${modo === 'rapido' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            ⚡ Pedido Rápido
          </button>
          <button
            onClick={() => setModo('buscar')}
            className={`px-3 py-2 rounded-t-lg text-sm ${modo === 'buscar' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            🔍 Buscar Cliente
          </button>
          <button
            onClick={() => setModo('cadastrar')}
            className={`px-3 py-2 rounded-t-lg text-sm ${modo === 'cadastrar' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            ➕ Cadastrar Cliente
          </button>
        </div>

        {/* Modo Pedido Rápido */}
        {modo === 'rapido' && (
          <form onSubmit={handlePedidoRapido} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Cliente
              </label>
              <input
                type="text"
                value={nomeRapido}
                onChange={(e) => setNomeRapido(capitalize(e.target.value))}
                placeholder="Ex: Maria Eduarda"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!nomeRapido.trim()}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
            >
              ⚡ Continuar
            </button>
          </form>
        )}

        {/* Modo Buscar */}
        {modo === 'buscar' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar por Nome/Telefone
              </label>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Digite o nome ou telefone"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Lista de clientes encontrados */}
            {clientesFiltrados.length > 0 && (
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                {clientesFiltrados.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => handleSelecionarCliente(cliente)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <p className="font-medium">{cliente.nome} {cliente.sobrenome || ''}</p>
                    {cliente.telefone && (
                      <p className="text-sm text-gray-500">{cliente.telefone}</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {busca.length >= 2 && clientesFiltrados.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">
                Nenhum cliente encontrado.
              </p>
            )}
          </div>
        )}

        {/* Modo Cadastrar */}
        {modo === 'cadastrar' && (
          <form onSubmit={handleCadastrar} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(capitalize(e.target.value))}
                required
                placeholder="Nome do cliente"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sobrenome *
              </label>
              <input
                type="text"
                value={sobrenome}
                onChange={(e) => setSobrenome(capitalize(e.target.value))}
                required
                placeholder="Sobrenome do cliente"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                required
                placeholder="(62) 99999-9999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={criarCliente.isPending || !nome.trim() || !sobrenome.trim() || telefone.length < 14}
              className="w-full bg-secondary-600 text-white py-2 rounded-lg hover:bg-secondary-700 disabled:opacity-50"
            >
              {criarCliente.isPending ? 'Cadastrando...' : 'Cadastrar Cliente'}
            </button>
          </form>
        )}



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
