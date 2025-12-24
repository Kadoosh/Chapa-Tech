import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Tabs } from '../components/admin/Tabs';
import { TabMesas } from '../components/admin/TabMesas';
import { TabUsuarios } from '../components/admin/TabUsuarios';
import { HiddenHeader } from '../components/common/HiddenHeader';

export function Admin() {
  const { user } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('mesas');

  const tabs = [
    { id: 'mesas', label: 'Mesas', icon: '🪑' },
    { id: 'usuarios', label: 'Usuários', icon: '👤' },
  ];

  const renderAbaAtiva = () => {
    switch (abaAtiva) {
      case 'mesas':
        return <TabMesas />;
      case 'usuarios':
        return <TabUsuarios />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden Header */}
      <HiddenHeader />

      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">⚙️ Administração</h1>
              <p className="text-sm opacity-90 mt-1">Olá, {user?.nome}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <Tabs tabs={tabs} activeTab={abaAtiva} onChange={setAbaAtiva} />
        </div>
      </div>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto p-6">
        {renderAbaAtiva()}
      </main>
    </div>
  );
}
