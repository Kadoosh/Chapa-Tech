import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import printerService from '../../services/printer.service';
import { FeedbackModal } from '../common/FeedbackModal';

// Componente para configurar uma impressora individual
function PrinterArea({ area, config, onConfigChange, onTestar, onImprimir, testando, imprimindo }) {
  const areaConfig = config[area] || {
    habilitada: false,
    nome: area === 'cozinha' ? 'Impressora Cozinha' : 'Impressora Caixa',
    tipo: 'EPSON',
    interface: 'network',
    endereco: '',
    porta: 9100,
    larguraPapel: 48,
    autoImprimir: false,
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onConfigChange(area, name, type === 'checkbox' ? checked : value);
  };

  const areaLabel = area === 'cozinha' ? '👨‍🍳 Cozinha' : '💰 Caixa';
  const areaDesc = area === 'cozinha'
    ? 'Imprime pedidos para preparo'
    : 'Imprime comprovantes de pagamento';

  return (
    <div className={`border-2 rounded-xl p-6 ${areaConfig.habilitada ? 'border-primary-300 bg-primary-50/30' : 'border-gray-200'}`}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {areaLabel}
          </h3>
          <p className="text-sm text-gray-500">{areaDesc}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="habilitada"
            checked={areaConfig.habilitada}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>

      {/* Configurações */}
      <div className={`space-y-4 ${!areaConfig.habilitada ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Impressora
            </label>
            <select
              name="tipo"
              value={areaConfig.tipo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="EPSON">EPSON</option>
              <option value="STAR">STAR</option>
              <option value="TANCA">TANCA</option>
              <option value="BEMATECH">BEMATECH</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interface
            </label>
            <select
              name="interface"
              value={areaConfig.interface}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="network">Rede (TCP/IP)</option>
              <option value="usb">USB</option>
              <option value="serial">Serial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço IP
            </label>
            <input
              type="text"
              name="endereco"
              value={areaConfig.endereco}
              onChange={handleChange}
              placeholder="192.168.1.100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Porta
            </label>
            <input
              type="number"
              name="porta"
              value={areaConfig.porta}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Largura do Papel
            </label>
            <select
              name="larguraPapel"
              value={areaConfig.larguraPapel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value={32}>32 caracteres (58mm)</option>
              <option value={48}>48 caracteres (80mm)</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="autoImprimir"
                checked={areaConfig.autoImprimir}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Impressão automática</span>
            </label>
          </div>
        </div>

        {/* Botões de teste */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onTestar(area)}
            disabled={testando || !areaConfig.habilitada}
            className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testando ? 'Testando...' : '🔌 Testar'}
          </button>
          <button
            onClick={() => onImprimir(area)}
            disabled={imprimindo || !areaConfig.habilitada}
            className="px-3 py-1.5 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {imprimindo ? 'Imprimindo...' : '🖨️ Imprimir Teste'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfigImpressora() {
  const queryClient = useQueryClient();
  const [localConfig, setLocalConfig] = useState(null);
  const [testingArea, setTestingArea] = useState(null);
  const [printingArea, setPrintingArea] = useState(null);
  const [feedback, setFeedback] = useState({ open: false, type: 'success', title: '', message: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['printer-config'],
    queryFn: printerService.obterConfig,
  });

  const config = localConfig ?? data ?? {
    cozinha: {
      habilitada: false,
      nome: 'Impressora Cozinha',
      tipo: 'EPSON',
      interface: 'network',
      endereco: '',
      porta: 9100,
      larguraPapel: 48,
      autoImprimir: false,
    },
    caixa: {
      habilitada: false,
      nome: 'Impressora Caixa',
      tipo: 'EPSON',
      interface: 'network',
      endereco: '',
      porta: 9100,
      larguraPapel: 48,
      autoImprimir: false,
    },
  };

  const salvarMutation = useMutation({
    mutationFn: printerService.atualizarConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printer-config'] });
      setLocalConfig(null);
      setFeedback({ open: true, type: 'success', title: 'Sucesso!', message: 'Configurações salvas com sucesso!' });
    },
    onError: (error) => {
      setFeedback({ open: true, type: 'error', title: 'Erro', message: error.message || 'Falha ao salvar' });
    },
  });

  const handleConfigChange = (area, name, value) => {
    setLocalConfig(prev => ({
      ...(prev ?? config),
      [area]: {
        ...((prev ?? config)[area]),
        [name]: value,
      },
    }));
  };

  const handleTestar = async (area) => {
    setTestingArea(area);
    try {
      const result = await printerService.testarConexao(area);
      const tipo = result.conectado ? 'success' : 'warning';
      setFeedback({ open: true, type: tipo, title: `Teste ${area.toUpperCase()}`, message: result.mensagem });
    } catch (error) {
      setFeedback({ open: true, type: 'error', title: 'Erro', message: error.message });
    } finally {
      setTestingArea(null);
    }
  };

  const handleImprimir = async (area) => {
    setPrintingArea(area);
    try {
      const result = await printerService.imprimirTeste(area);
      const tipo = result.sucesso ? 'success' : 'error';
      setFeedback({ open: true, type: tipo, title: `Impressão ${area.toUpperCase()}`, message: result.mensagem });
    } catch (error) {
      setFeedback({ open: true, type: 'error', title: 'Erro', message: error.message });
    } finally {
      setPrintingArea(null);
    }
  };

  const handleSalvar = () => {
    salvarMutation.mutate(config);
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          🖨️ Configuração de Impressoras
        </h2>

        <p className="text-gray-600 mb-6">
          Configure impressoras separadas para cada área do sistema.
        </p>

        {/* Grid de Impressoras */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PrinterArea
            area="cozinha"
            config={config}
            onConfigChange={handleConfigChange}
            onTestar={handleTestar}
            onImprimir={handleImprimir}
            testando={testingArea === 'cozinha'}
            imprimindo={printingArea === 'cozinha'}
          />

          <PrinterArea
            area="caixa"
            config={config}
            onConfigChange={handleConfigChange}
            onTestar={handleTestar}
            onImprimir={handleImprimir}
            testando={testingArea === 'caixa'}
            imprimindo={printingArea === 'caixa'}
          />
        </div>

        {/* Botão Salvar */}
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={handleSalvar}
            disabled={salvarMutation.isPending}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {salvarMutation.isPending ? 'Salvando...' : '💾 Salvar Todas as Configurações'}
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">ℹ️ Como funciona</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>👨‍🍳 Cozinha:</strong> Recebe impressão de pedidos automaticamente</li>
          <li><strong>💰 Caixa:</strong> Recebe impressão de comprovantes de pagamento</li>
        </ul>
      </div>

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
