import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Tabs } from '../components/admin/Tabs';
import { TabProdutos } from '../components/admin/TabProdutos';
import { TabCategorias } from '../components/admin/TabCategorias';
import { TabAcompanhamentos } from '../components/admin/TabAcompanhamentos';
import { HiddenHeader } from '../components/common/HiddenHeader';

export function CatalogoProdutos() {
    const { user } = useAuth();
    const [abaAtiva, setAbaAtiva] = useState('produtos');

    const tabs = [
        { id: 'produtos', label: 'Produtos', icon: '🍔' },
        { id: 'categorias', label: 'Categorias', icon: '🏷️' },
        { id: 'acompanhamentos', label: 'Acompanhamentos', icon: '🍟' },
    ];

    const renderAbaAtiva = () => {
        switch (abaAtiva) {
            case 'produtos':
                return <TabProdutos />;
            case 'categorias':
                return <TabCategorias />;
            case 'acompanhamentos':
                return <TabAcompanhamentos />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hidden Header */}
            <HiddenHeader />

            {/* Header */}
            <header className="bg-rose-600 text-white shadow-lg p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">📋 Catálogo de Produtos</h1>
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
