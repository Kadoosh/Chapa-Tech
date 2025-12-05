import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import printerService from '../../services/printer.service';

export function ConfigImpressora() {
  const queryClient = useQueryClient();
  const [localConfig, setLocalConfig] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['printer-config'],
    queryFn: printerService.obterConfig,
  });

  // Usar dados locais se editados, senão usar dados do servidor
  const config = localConfig ?? data ?? {
    habilitada: false,
    tipo: 'EPSON',
    interface: 'network',
    endereco: '',
    porta: 9100,
    larguraPapel: 48,
    autoImprimirPedido: false,
    autoImprimirComprovante: false,
  };

  const salvarMutation = useMutation({
    mutationFn: printerService.atualizarConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printer-config'] });
      setLocalConfig(null); // Limpar edições locais após salvar
      alert('Configurações salvas com sucesso!');
    },
  });

  const testarMutation = useMutation({
    mutationFn: printerService.testarConexao,
    onSuccess: (result) => {
      alert(result.mensagem || 'Teste realizado!');
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

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        🖨️ Configuração da Impressora
      </h2>

      <div className="space-y-6">
        {/* Habilitar/Desabilitar */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Impressora Habilitada</h3>
            <p className="text-sm text-gray-500">Ativar integração com impressora térmica</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="habilitada"
              checked={config.habilitada}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        {/* Configurações de Conexão */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Impressora
            </label>
            <select
              name="tipo"
              value={config.tipo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="EPSON">EPSON</option>
              <option value="STAR">STAR</option>
              <option value="TANCA">TANCA</option>
              <option value="BEMATECH">BEMATECH</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interface de Conexão
            </label>
            <select
              name="interface"
              value={config.interface}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="network">Rede (TCP/IP)</option>
              <option value="usb">USB</option>
              <option value="serial">Serial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço IP
            </label>
            <input
              type="text"
              name="endereco"
              value={config.endereco}
              onChange={handleChange}
              placeholder="192.168.1.100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Porta
            </label>
            <input
              type="number"
              name="porta"
              value={config.porta}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Largura do Papel (caracteres)
            </label>
            <select
              name="larguraPapel"
              value={config.larguraPapel}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value={32}>32 (58mm)</option>
              <option value={48}>48 (80mm)</option>
            </select>
          </div>
        </div>

        {/* Impressão Automática */}
        <div className="border-t pt-6">
          <h3 className="font-medium text-gray-900 mb-4">Impressão Automática</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="autoImprimirPedido"
                checked={config.autoImprimirPedido}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Imprimir automaticamente pedidos na cozinha</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="autoImprimirComprovante"
                checked={config.autoImprimirComprovante}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Imprimir automaticamente comprovante ao finalizar</span>
            </label>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => testarMutation.mutate()}
            disabled={testarMutation.isPending}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {testarMutation.isPending ? 'Testando...' : '🔌 Testar Conexão'}
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvarMutation.isPending}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {salvarMutation.isPending ? 'Salvando...' : '💾 Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
}
