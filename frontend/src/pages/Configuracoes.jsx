import { useState } from 'react';
import { ConfigImpressora } from '../components/configuracoes/ConfigImpressora';
import { ConfigBackup } from '../components/configuracoes/ConfigBackup';
import { HiddenHeader } from '../components/common/HiddenHeader';

const tabs = [
  { id: 'impressora', label: '🖨️ Impressora', icon: '🖨️' },
  { id: 'backup', label: '💾 Backup', icon: '💾' },
];

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('impressora');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hidden Header */}
      <HiddenHeader />

      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/hub"
                className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
              >
                ← Voltar
              </a>
              <h1 className="text-2xl font-bold">⚙️ Configurações</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div>
          {activeTab === 'impressora' && <ConfigImpressora />}
          {activeTab === 'backup' && <ConfigBackup />}
        </div>
      </div>
    </div>
  );
}
