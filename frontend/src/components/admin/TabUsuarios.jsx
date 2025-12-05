import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useAdmin } from '../../hooks/useAdmin';
import { Modal } from '../common/Modal';
import { FeedbackModal } from '../common/FeedbackModal';

export function TabUsuarios() {
  const [abaAtiva, setAbaAtiva] = useState('usuarios'); // 'usuarios' ou 'grupos'

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setAbaAtiva('usuarios')}
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${
              abaAtiva === 'usuarios'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            👤 Usuários
          </button>
          <button
            onClick={() => setAbaAtiva('grupos')}
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${
              abaAtiva === 'grupos'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            👥 Grupos
          </button>
        </nav>
      </div>

      {/* Conteúdo da aba */}
      {abaAtiva === 'usuarios' ? <AbaUsuarios /> : <AbaGrupos />}
    </div>
  );
}

// ============================================
// ABA USUÁRIOS
// ============================================
function AbaUsuarios() {
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [feedback, setFeedback] = useState({ open: false, type: 'success', title: '', message: '' });

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

  // usuariosData retorna { usuarios, total, page, totalPages }
  // gruposData retorna array diretamente
  const usuarios = usuariosData?.usuarios || [];
  const grupos = Array.isArray(gruposData) ? gruposData : [];

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
            setFeedback({ open: true, type: 'success', title: 'Sucesso!', message: 'Usuário salvo com sucesso!' });
          } catch (error) {
            setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
          }
        }}
      />

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

// ============================================
// ABA GRUPOS
// ============================================
function AbaGrupos() {
  const [modalAberto, setModalAberto] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState(null);
  const [feedback, setFeedback] = useState({ open: false, type: 'success', title: '', message: '' });
  const queryClient = useQueryClient();

  const { data: gruposData } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const response = await api.get('/usuarios/grupos');
      return response.data;
    },
  });

  const criarGrupo = useMutation({
    mutationFn: (dados) => api.post('/usuarios/grupos', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
  });

  const atualizarGrupo = useMutation({
    mutationFn: ({ id, dados }) => api.put(`/usuarios/grupos/${id}`, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
  });

  const deletarGrupo = useMutation({
    mutationFn: (id) => api.delete(`/usuarios/grupos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
  });

  // gruposData já é o array de grupos (response.data)
  const grupos = Array.isArray(gruposData) ? gruposData : [];

  const handleNovo = () => {
    setGrupoEditando(null);
    setModalAberto(true);
  };

  const handleEditar = (grupo) => {
    setGrupoEditando(grupo);
    setModalAberto(true);
  };

  const handleDeletar = async (grupo) => {
    if (confirm(`Deseja realmente excluir o grupo "${grupo.nome}"?`)) {
      try {
        await deletarGrupo.mutateAsync(grupo.id);
        setFeedback({ open: true, type: 'success', title: 'Sucesso!', message: 'Grupo excluído com sucesso!' });
      } catch (error) {
        setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
      }
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
          + Novo Grupo
        </button>
      </div>

      {/* Grid de Grupos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grupos.map((grupo) => (
          <div
            key={grupo.id}
            className="bg-white rounded-lg shadow p-4 border-l-4 border-primary-500"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{grupo.nome}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  grupo.ativo
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {grupo.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            {grupo.descricao && (
              <p className="text-sm text-gray-500 mb-3">{grupo.descricao}</p>
            )}

            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => handleEditar(grupo)}
                className="flex-1 px-3 py-1.5 text-sm text-primary-600 border border-primary-600 rounded hover:bg-primary-50"
              >
                ✏️ Editar
              </button>
              <button
                onClick={() => handleDeletar(grupo)}
                className="flex-1 px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
              >
                🗑️ Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {grupos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum grupo cadastrado. Clique em "+ Novo Grupo" para criar.
        </div>
      )}

      {/* Modal de Form */}
      <GrupoFormModal
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setGrupoEditando(null);
        }}
        grupo={grupoEditando}
        onSave={async (dados) => {
          try {
            if (grupoEditando) {
              await atualizarGrupo.mutateAsync({ id: grupoEditando.id, dados });
            } else {
              await criarGrupo.mutateAsync(dados);
            }
            setModalAberto(false);
            setGrupoEditando(null);
            setFeedback({ open: true, type: 'success', title: 'Sucesso!', message: 'Grupo salvo com sucesso!' });
          } catch (error) {
            setFeedback({ open: true, type: 'error', title: 'Erro!', message: error.response?.data?.message || error.message });
          }
        }}
      />

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

// ============================================
// MODAL FORMULÁRIO GRUPO
// ============================================
function GrupoFormModal({ isOpen, onClose, grupo, onSave }) {
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    ativo: true,
  });

  useEffect(() => {
    if (grupo) {
      setForm({
        nome: grupo.nome || '',
        descricao: grupo.descricao || '',
        ativo: grupo.ativo ?? true,
      });
    } else {
      setForm({ nome: '', descricao: '', ativo: true });
    }
  }, [grupo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={grupo ? 'Editar Grupo' : 'Novo Grupo'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Grupo *
          </label>
          <input
            type="text"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Ex: Administrador, Atendente, Cozinha..."
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
            placeholder="Descrição das responsabilidades do grupo..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="grupoAtivo"
            checked={form.ativo}
            onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="grupoAtivo" className="text-sm font-medium text-gray-700">
            Grupo ativo
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

// ============================================
// MODAL FORMULÁRIO USUÁRIO
// ============================================
function UsuarioFormModal({ isOpen, onClose, usuario, grupos, onSave }) {
  const [form, setForm] = useState({
    nome: '',
    senha: '',
    grupoId: '',
    ativo: true,
  });

  useEffect(() => {
    if (usuario) {
      setForm({
        nome: usuario.nome || '',
        senha: '',
        grupoId: usuario.grupoId || '',
        ativo: usuario.ativo ?? true,
      });
    } else {
      setForm({
        nome: '',
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
