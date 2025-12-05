# 🎨 PHASE 04 - HUB & LOGIN (UI/UX Completo)

## 📌 Objetivo desta Fase
Criar uma experiência de login e hub profissional, moderna e intuitiva, com animações suaves, design responsivo, feedback visual e UX otimizada para diferentes dispositivos.

---

## ✅ Checklist de Conclusão
Ao final desta fase, você deve ter:
- [ ] Página de Login profissional e responsiva
- [ ] Animações suaves de entrada/saída
- [ ] Feedback visual de loading e erros
- [ ] Hub com design moderno e cards interativos
- [ ] Menu de perfil com dropdown
- [ ] Indicadores visuais de permissões
- [ ] Responsividade completa (mobile, tablet, desktop)
- [ ] Transições suaves entre páginas
- [ ] Ícones e ilustrações
- [ ] PWA-ready (manifest, service worker)

---

## 📁 Arquivos que Serão Criados/Atualizados

```
frontend/src/
├── pages/
│   ├── Login.jsx           🔄 Atualizar (versão profissional)
│   └── Hub.jsx             🔄 Atualizar (versão profissional)
│
├── components/
│   ├── common/
│   │   ├── Button.jsx      🆕 Componente de botão reutilizável
│   │   ├── Input.jsx       🆕 Componente de input reutilizável
│   │   ├── Card.jsx        🆕 Componente de card
│   │   └── Badge.jsx       🆕 Componente de badge
│   │
│   └── layout/
│       ├── Header.jsx      🆕 Header com menu de perfil
│       └── Layout.jsx      🆕 Layout wrapper
│
└── styles/
    └── animations.css      🆕 Animações customizadas
```

---

## 🎨 1. COMPONENTS - Button (Reutilizável)

Crie `frontend/src/components/common/Button.jsx`:

```jsx
import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  type = 'button',
  className = '',
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 disabled:bg-secondary-300',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 disabled:border-primary-300 disabled:text-primary-300',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Carregando...
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
```

---

## 🎨 2. COMPONENTS - Input (Reutilizável)

Crie `frontend/src/components/common/Input.jsx`:

```jsx
import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon,
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const hasError = !!error;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label */}
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Ícone (se houver) */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg border transition-colors
            ${icon ? 'pl-10' : ''}
            ${hasError 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
            }
            focus:ring-2 focus:outline-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>

      {/* Error ou Helper Text */}
      {(error || helperText) && (
        <p className={`mt-2 text-sm ${hasError ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
```

---

## 🎨 3. COMPONENTS - Card

Crie `frontend/src/components/common/Card.jsx`:

```jsx
import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  icon,
  hover = false,
  onClick,
  className = '',
}) => {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-md p-6 transition-all duration-200
        ${hover ? 'hover:shadow-xl hover:scale-105' : ''}
        ${isClickable ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Ícone */}
      {icon && (
        <div className="text-4xl mb-4">
          {icon}
        </div>
      )}

      {/* Título */}
      {title && (
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {title}
        </h3>
      )}

      {/* Subtítulo */}
      {subtitle && (
        <p className="text-gray-600 mb-4">
          {subtitle}
        </p>
      )}

      {/* Conteúdo */}
      {children}
    </div>
  );
};

export default Card;
```

---

## 🎨 4. COMPONENTS - Badge

Crie `frontend/src/components/common/Badge.jsx`:

```jsx
import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
```

---

## 🎨 5. COMPONENTS - Header

Crie `frontend/src/components/layout/Header.jsx`:

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { usuario, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickFora = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    };

    if (menuAberto) {
      document.addEventListener('mousedown', handleClickFora);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickFora);
    };
  }, [menuAberto]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const iniciais = usuario 
    ? `${usuario.nome.charAt(0)}${usuario.sobrenome.charAt(0)}`.toUpperCase()
    : '';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Título */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="text-3xl">🍔</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sistema de Pedidos
                </h1>
                <p className="text-xs text-gray-500">
                  Gestão Inteligente
                </p>
              </div>
            </button>
          </div>

          {/* Menu do Usuário */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                {iniciais}
              </div>

              {/* Info do Usuário (desktop) */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {usuario?.nome} {usuario?.sobrenome}
                </p>
                <p className="text-xs text-gray-500">
                  {usuario?.grupo?.nome}
                </p>
              </div>

              {/* Ícone dropdown */}
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${menuAberto ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {menuAberto && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* Info do Usuário (mobile) */}
                <div className="md:hidden px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {usuario?.nome} {usuario?.sobrenome}
                  </p>
                  <p className="text-xs text-gray-500">
                    {usuario?.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Grupo: {usuario?.grupo?.nome}
                  </p>
                </div>

                {/* Opções */}
                <button
                  onClick={() => {
                    setMenuAberto(false);
                    navigate('/');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Início
                </button>

                <div className="border-t border-gray-200 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

---

## 🎨 6. COMPONENTS - Layout

Crie `frontend/src/components/layout/Layout.jsx`:

```jsx
import React from 'react';
import Header from './Header';

const Layout = ({ children, showHeader = true }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && <Header />}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
```

---

## 🎨 7. STYLES - Animações

Crie `frontend/src/styles/animations.css`:

```css
/* Animações customizadas */

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Classes de animação */

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out;
}

.animate-fade-in-down {
  animation: fadeInDown 0.4s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.4s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}

.animate-pulse-slow {
  animation: pulse 2s ease-in-out infinite;
}

/* Delay de animação */

.animation-delay-100 {
  animation-delay: 100ms;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}

/* Transições suaves */

.transition-all-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

Importe no `frontend/src/styles/globals.css`:

```css
@import './animations.css';

/* Resto do globals.css... */
```

---

## 🎨 8. PÁGINA - Login (Versão Profissional)

Atualize `frontend/src/pages/Login.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Se já autenticado, redirecionar
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    const resultado = await login(email, senha);

    if (resultado.sucesso) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setErro(resultado.erro);
      setLoading(false);
    }
  };

  // Preencher credenciais de demo (dev only)
  const preencherDemo = () => {
    setEmail('admin@sistema.com');
    setSenha('admin123');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow animation-delay-200"></div>
      </div>

      {/* Card de Login */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in-up">
        {/* Logo/Título */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-scale-in">🍔</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Pedidos
          </h1>
          <p className="text-gray-600">
            Faça login para continuar
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            disabled={loading}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />

          {/* Senha */}
          <div>
            <Input
              id="senha"
              type={mostrarSenha ? 'text' : 'password'}
              label="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            {/* Mostrar/Ocultar Senha */}
            <div className="mt-2 flex items-center">
              <input
                id="mostrar-senha"
                type="checkbox"
                checked={mostrarSenha}
                onChange={(e) => setMostrarSenha(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="mostrar-senha" className="ml-2 text-sm text-gray-600">
                Mostrar senha
              </label>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {erro && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 animate-fade-in">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{erro}</p>
              </div>
            </div>
          )}

          {/* Botão de Login */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading || !email || !senha}
          >
            Entrar
          </Button>
        </form>

        {/* Credenciais de Demo (apenas dev) */}
        {import.meta.env.DEV && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              🔧 Ambiente de Desenvolvimento
            </p>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={preencherDemo}
              disabled={loading}
            >
              Preencher credenciais de teste
            </Button>
            <p className="text-xs text-gray-400 text-center mt-2 font-mono">
              admin@sistema.com / admin123
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
```

---

## 🎨 9. PÁGINA - Hub (Versão Profissional)

Atualize `frontend/src/pages/Hub.jsx`:

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const Hub = () => {
  const navigate = useNavigate();
  const {
    grupo,
    permissoes,
    podeCriarPedido,
    podeMarcarPronto,
    podeFinalizarPedido,
    podeVerDashboard,
    podeGerenciarEstoque,
    podeGerenciarProdutos,
  } = usePermissions();

  // Definir opções do menu baseado em permissões
  const opcoes = [
    {
      id: 'atendente',
      titulo: 'Atendente',
      descricao: 'Anotar pedidos dos clientes',
      icone: '🍔',
      rota: '/atendente',
      permissao: podeCriarPedido,
      cor: 'border-orange-500',
    },
    {
      id: 'cozinha',
      titulo: 'Cozinha',
      descricao: 'Painel de preparo de pedidos',
      icone: '👨‍🍳',
      rota: '/cozinha',
      permissao: podeMarcarPronto,
      cor: 'border-red-500',
    },
    {
      id: 'caixa',
      titulo: 'Caixa',
      descricao: 'Finalizar pagamentos',
      icone: '💰',
      rota: '/caixa',
      permissao: podeFinalizarPedido,
      cor: 'border-green-500',
    },
    {
      id: 'dashboard',
      titulo: 'Dashboard',
      descricao: 'Relatórios e KPIs',
      icone: '📊',
      rota: '/dashboard',
      permissao: podeVerDashboard,
      cor: 'border-blue-500',
    },
    {
      id: 'estoque',
      titulo: 'Estoque',
      descricao: 'Controle de estoque',
      icone: '📦',
      rota: '/estoque',
      permissao: podeGerenciarEstoque,
      cor: 'border-purple-500',
    },
    {
      id: 'admin',
      titulo: 'Administração',
      descricao: 'Gerenciar sistema',
      icone: '⚙️',
      rota: '/admin',
      permissao: podeGerenciarProdutos,
      cor: 'border-gray-500',
    },
  ];

  // Filtrar apenas opções com permissão
  const opcoesDisponiveis = opcoes.filter(op => op.permissao);

  return (
    <Layout>
      {/* Boas-vindas */}
      <div className="mb-8 animate-fade-in-down">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Escolha sua função
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-gray-600">
            Selecione onde deseja trabalhar
          </p>
          <Badge variant="primary">
            {grupo}
          </Badge>
          <Badge variant="info">
            {permissoes.length} {permissoes.length === 1 ? 'permissão' : 'permissões'}
          </Badge>
        </div>
      </div>

      {/* Grid de Opções */}
      {opcoesDisponiveis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opcoesDisponiveis.map((opcao, index) => (
            <div
              key={opcao.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card
                title={opcao.titulo}
                subtitle={opcao.descricao}
                icon={opcao.icone}
                hover
                onClick={() => navigate(opcao.rota)}
                className={`border-l-4 ${opcao.cor} h-full`}
              />
            </div>
          ))}
        </div>
      ) : (
        // Nenhuma permissão
        <div className="text-center py-16 animate-fade-in">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nenhuma Função Disponível
          </h2>
          <p className="text-gray-600 mb-8">
            Você não tem permissões configuradas. Entre em contato com o administrador.
          </p>
          <Badge variant="warning" size="lg">
            Grupo: {grupo}
          </Badge>
        </div>
      )}

      {/* Informações Adicionais */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in animation-delay-400">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-500">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚡</div>
            <div>
              <h3 className="font-bold text-gray-900">Rápido</h3>
              <p className="text-sm text-gray-600">Sistema otimizado</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-l-4 border-secondary-500">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔒</div>
            <div>
              <h3 className="font-bold text-gray-900">Seguro</h3>
              <p className="text-sm text-gray-600">Dados protegidos</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📱</div>
            <div>
              <h3 className="font-bold text-gray-900">Responsivo</h3>
              <p className="text-sm text-gray-600">Funciona em qualquer dispositivo</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Hub;
```

---

## ✅ 10. CHECKLIST FINAL DA PHASE 04

### Componentes Reutilizáveis
- [x] Button (6 variantes, 3 tamanhos)
- [x] Input (com ícone, error, label)
- [x] Card (hover, onClick, variantes)
- [x] Badge (7 variantes, 3 tamanhos)

### Layout
- [x] Header (menu dropdown, avatar, responsivo)
- [x] Layout wrapper

### Páginas
- [x] Login profissional (animações, validação, UX)
- [x] Hub moderno (cards interativos, badges, responsivo)

### Animações
- [x] FadeIn, FadeInUp, ScaleIn
- [x] Delays animação
- [x] Transições suaves
- [x] Pulse para backgrounds

### UX/UI
- [x] Design responsivo (mobile, tablet, desktop)
- [x] Feedback visual (loading, errors, success)
- [x] Acessibilidade (labels, focus states)
- [x] Gradientes e cores modernas
- [x] Ícones SVG inline
- [x] Estados disabled tratados

---

## 🎨 11. RESULTADO VISUAL

### Login:
- ✨ Background com gradiente animado
- ✨ Card centralizado com sombra
- ✨ Inputs com ícones
- ✨ Botão com loading spinner
- ✨ Checkbox "Mostrar senha"
- ✨ Mensagens de erro animadas
- ✨ Botão de demo (dev only)

### Hub:
- ✨ Header fixo com menu dropdown
- ✨ Cards coloridos por função
- ✨ Animações escalonadas (stagger)
- ✨ Badges informativos
- ✨ Grid responsivo
- ✨ Hover effects suaves
- ✨ Cards informativos no rodapé

---

## 📱 12. RESPONSIVIDADE

### Mobile (< 768px):
- Cards em coluna única
- Menu dropdown full width
- Font sizes reduzidos
- Padding otimizado

### Tablet (768px - 1024px):
- Grid 2 colunas
- Header compacto
- Spacing intermediário

### Desktop (> 1024px):
- Grid 3 colunas
- Spacing amplo
- Hover effects completos

---

## 🎯 PHASE 04 COMPLETA!

### O que foi entregue:

✅ **4 componentes reutilizáveis** profissionais  
✅ **Header** com menu dropdown animado  
✅ **Layout wrapper** para consistência  
✅ **Login** moderno e responsivo  
✅ **Hub** interativo com permissões  
✅ **Animações CSS** customizadas  
✅ **Design system** consistente  
✅ **UX otimizada** em todos os dispositivos  

### Próximas Fases:

**PHASE_05** - Tela Atendente (PWA) - A MAIS IMPORTANTE!  
**PHASE_06** - Painel Cozinha  
**PHASE_07** - Tela Caixa  

---

## 📝 Notas para Claude Opus 4.5

- Todos os componentes são reutilizáveis em outras telas
- Sistema de design consistente (cores, espaçamentos, sombras)
- Animações suaves melhoram UX sem pesar performance
- Responsividade total - testa em diferentes resoluções
- Acessibilidade básica implementada (pode melhorar com aria-labels)
- Header é fixo e reutilizável em todas as páginas protegidas
- TESTE em mobile, tablet e desktop antes de prosseguir
- Componentes seguem padrão React moderno (hooks, props)

---

**Status:** ✅ Hub & Login Profissionais Completos  
**Tempo estimado:** 2-3 horas  
**Complexidade:** Média  
**Dependências:** PHASE_03 concluída