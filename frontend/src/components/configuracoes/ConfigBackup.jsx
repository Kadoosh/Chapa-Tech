import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import backupService from '../../services/backup.service';

export function ConfigBackup() {
  const queryClient = useQueryClient();
  const [localConfig, setLocalConfig] = useState(null);

  // Queries
  const { data: configData, isLoading: loadingConfig } = useQuery({
    queryKey: ['backup-config'],
    queryFn: backupService.obterConfig,
  });

  const { data: backupsData, isLoading: loadingBackups, refetch: refetchBackups } = useQuery({
    queryKey: ['backups-lista'],
    queryFn: backupService.listarBackups,
  });

  // Usar dados locais se editados, senão usar dados do servidor
  const config = localConfig ?? configData ?? {
    habilitado: true,
    intervalo: 'diario',
    horario: '03:00',
    retencaoDias: 30,
  };

  // Mutations
  const salvarMutation = useMutation({
    mutationFn: backupService.atualizarConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-config'] });
      setLocalConfig(null); // Limpar edições locais após salvar
      alert('Configurações salvas!');
    },
  });

  const criarBackupMutation = useMutation({
    mutationFn: backupService.criarBackup,
    onSuccess: () => {
      refetchBackups();
      alert('Backup criado com sucesso!');
    },
    onError: (error) => {
      alert('Erro ao criar backup: ' + (error.response?.data?.message || error.message));
    },
  });

  const deletarMutation = useMutation({
    mutationFn: backupService.deletarBackup,
    onSuccess: () => {
      refetchBackups();
    },
  });

  const limparMutation = useMutation({
    mutationFn: backupService.limparBackups,
    onSuccess: (result) => {
      refetchBackups();
      alert(result.mensagem);
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalConfig(prev => ({
      ...(prev ?? config),
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSalvar = () => {
    salvarMutation.mutate(config);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  const backups = backupsData?.backups || [];

  return (
    <div className="space-y-6">
      {/* Configurações */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          💾 Configuração de Backup
        </h2>

        {loadingConfig ? (
          <div className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>
        ) : (
          <div className="space-y-6">
            {/* Habilitar */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Backup Automático</h3>
                <p className="text-sm text-gray-500">Realizar backups automaticamente</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="habilitado"
                  checked={config.habilitado}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intervalo
                </label>
                <select
                  name="intervalo"
                  value={config.intervalo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="diario">Diário</option>
                  <option value="semanal">Semanal</option>
                  <option value="manual">Apenas Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário
                </label>
                <input
                  type="time"
                  name="horario"
                  value={config.horario}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retenção (dias)
                </label>
                <input
                  type="number"
                  name="retencaoDias"
                  value={config.retencaoDias}
                  onChange={handleChange}
                  min="1"
                  max="365"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Último backup */}
            {config.ultimoBackup && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Último backup: {formatarData(config.ultimoBackup)}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSalvar}
                disabled={salvarMutation.isPending}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {salvarMutation.isPending ? 'Salvando...' : '💾 Salvar Configurações'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Backups */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">📁 Backups Disponíveis</h2>
          <div className="flex gap-2">
            <button
              onClick={() => limparMutation.mutate()}
              disabled={limparMutation.isPending}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              🧹 Limpar Antigos
            </button>
            <button
              onClick={() => criarBackupMutation.mutate()}
              disabled={criarBackupMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {criarBackupMutation.isPending ? 'Criando...' : '➕ Criar Backup'}
            </button>
          </div>
        </div>

        {loadingBackups ? (
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">📭</p>
            <p>Nenhum backup encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => (
              <div 
                key={backup.arquivo}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">
                    {backup.tipo === 'automatico' ? '🤖' : backup.tipo === 'manual' ? '👤' : '🔄'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{backup.arquivo}</p>
                    <p className="text-sm text-gray-500">
                      {formatarData(backup.criadoEm)} • {backup.tamanhoFormatado}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={backupService.getDownloadUrl(backup.arquivo)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download"
                  >
                    ⬇️
                  </a>
                  <button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir este backup?')) {
                        deletarMutation.mutate(backup.arquivo);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
