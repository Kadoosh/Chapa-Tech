import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAdmin } from '../../hooks/useAdmin';
import { Modal } from '../common/Modal';

export function TabUsuarios() {
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const { data: usuariosData } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const response = await api.get('/usuarios');
      return response.data;
    },
  });

  const { data: gruposData } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const response = await api.get('/usuarios/grupos');
      return response.data;
    },
  });

  const { criarUsuario, atualizarUsuario } = useAdmin();

  const usuarios = usuariosData?.data || [];
  const grupos = gruposData?.data || [];

  const handleNovo = () => {
    setUsuarioEditando(null);
    setModalAberto(true);
  };

  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setModalAberto(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-end">
        <button
          onClick={handleNovo}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
        >
          + Novo Usuário
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Grupo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{usuario.nome}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{usuario.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {usuario.grupo?.nome || '-'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      usuario.ativo
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <button
                    onClick={() => handleEditar(usuario)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Form */}
      <UsuarioFormModal
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setUsuarioEditando(null);
        }}
        usuario={usuarioEditando}
        grupos={grupos}
        onSave={async (dados) => {
          try {
            if (usuarioEditando) {
              await atualizarUsuario.mutateAsync({ id: usuarioEditando.id, dados });
            } else {
              await criarUsuario.mutateAsync(dados);
            }
            setModalAberto(false);
            setUsuarioEditando(null);
            alert('Usuário salvo com sucesso!');
          } catch (error) {
            alert('Erro ao salvar: ' + (error.response?.data?.message || error.message));
          }
        }}
      />
    </div>
  );
}

// Modal de Formulário
function UsuarioFormModal({ isOpen, onClose, usuario, grupos, onSave }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    grupoId: '',
    ativo: true,
  });

  useState(() => {
    if (usuario) {
      setForm({
        nome: usuario.nome || '',
        email: usuario.email || '',
        senha: '',
        grupoId: usuario.grupoId || '',
        ativo: usuario.ativo ?? true,
      });
    } else {
      setForm({
        nome: '',
        email: '',
        senha: '',
        grupoId: '',
        ativo: true,
      });
    }
  }, [usuario]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dados = {
      ...form,
      grupoId: parseInt(form.grupoId),
    };
    if (!dados.senha) delete dados.senha;
    onSave(dados);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={usuario ? 'Editar Usuário' : 'Novo Usuário'}
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
            Email *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha {!usuario && '*'}
          </label>
          <input
            type="password"
            required={!usuario}
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            placeholder={usuario ? 'Deixe em branco para manter' : ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grupo *
          </label>
          <select
            required
            value={form.grupoId}
            onChange={(e) => setForm({ ...form, grupoId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Selecione um grupo</option>
            {grupos.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ativo"
            checked={form.ativo}
            onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
            Usuário ativo
          </label>
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
