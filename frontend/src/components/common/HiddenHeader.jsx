import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Header oculto que aparece ao passar o mouse no topo da tela
 * Permite voltar ao Hub de qualquer página
 */
export function HiddenHeader() {
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <>
            {/* Trigger area - invisible bar at the top */}
            <div
                className="fixed top-0 left-0 right-0 h-2 z-50"
                onMouseEnter={() => setIsVisible(true)}
            />

            {/* Header container */}
            <div
                className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
                    }`}
                onMouseLeave={() => setIsVisible(false)}
            >
                <div className="bg-gray-900/95 backdrop-blur-sm text-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                        {/* Left: Back to Hub */}
                        <button
                            onClick={() => navigate('/hub')}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <span className="text-lg">←</span>
                            <span className="font-medium">Voltar ao Hub</span>
                        </button>

                        {/* Center: Logo */}
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🍔</span>
                            <span className="font-semibold hidden sm:inline">Sistema Lanchonete</span>
                        </div>

                        {/* Right: User info & Logout */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-300 hidden sm:inline">
                                {user?.nome}
                            </span>
                            <button
                                onClick={logout}
                                className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-sm transition-colors"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
