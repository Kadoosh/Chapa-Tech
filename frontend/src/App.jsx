import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/Login';
import { Hub } from './pages/Hub';
import { Atendente } from './pages/Atendente';
import { Cozinha } from './pages/Cozinha';
import { Caixa } from './pages/Caixa';
import { Admin } from './pages/Admin';
import { Dashboard } from './pages/Dashboard';
import { Estoque } from './pages/Estoque';
import Configuracoes from './pages/Configuracoes';

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 segundos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          {/* Rota pública - Login */}
          <Route path="/login" element={<Login />} />

          {/* Rota protegida - Hub (seleção de área) */}
          <Route
            path="/hub"
            element={
              <ProtectedRoute>
                <Hub />
              </ProtectedRoute>
            }
          />

          {/* Rotas protegidas - Áreas do sistema */}
          <Route
            path="/atendente"
            element={
              <ProtectedRoute requiredPermission="criar_pedido">
                <Atendente />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cozinha"
            element={
              <ProtectedRoute requiredPermission="ver_pedidos">
                <Cozinha />
              </ProtectedRoute>
            }
          />

          <Route
            path="/caixa"
            element={
              <ProtectedRoute requiredPermission="finalizar_pedido">
                <Caixa />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredPermission="gerenciar_usuarios">
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredPermission="gerenciar_usuarios">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/estoque"
            element={
              <ProtectedRoute requiredPermission="gerenciar_estoque">
                <Estoque />
              </ProtectedRoute>
            }
          />

          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute requiredPermission="gerenciar_usuarios">
                <Configuracoes />
              </ProtectedRoute>
            }
          />

          {/* Redireciona raiz para /hub */}
          <Route path="/" element={<Navigate to="/hub" replace />} />

          {/* 404 - Página não encontrada */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
                  <a
                    href="/hub"
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Voltar ao início
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
