import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Componente para proteger rotas que requerem autenticação
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes filhos
 * @param {string} props.requiredPermission - Chave da permissão necessária
 * @param {string} props.requiredGroup - Grupo necessário
 */
export function ProtectedRoute({ 
  children, 
  requiredPermission = null,
  requiredGroup = null 
}) {
  const { isAuthenticated, loading, hasPermission, hasGroup } = useAuth();

  // Aguarda verificação de autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não autenticado - redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verifica permissão específica
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Verifica grupo específico
  if (requiredGroup && !hasGroup(requiredGroup)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">
            Esta página é restrita ao grupo: <strong>{requiredGroup}</strong>
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return children;
}
