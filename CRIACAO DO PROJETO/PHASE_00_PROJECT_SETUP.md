# 🚀 PHASE 00 - PROJECT SETUP (Configuração Inicial)

## 📌 Objetivo desta Fase
Criar a estrutura completa do projeto, configurar ferramentas, definir padrões de código e preparar o ambiente de desenvolvimento para que todas as próximas fases funcionem perfeitamente.

---

## ✅ Checklist de Conclusão
Ao final desta fase, você deve ter:
- [ ] Estrutura de diretórios completa criada
- [ ] Backend configurado (Node.js + Express + Prisma)
- [ ] Frontend configurado (React + Vite + Tailwind)
- [ ] Prisma Schema inicial criado
- [ ] WebSocket configurado (Socket.io)
- [ ] Variáveis de ambiente configuradas
- [ ] Git inicializado com .gitignore apropriado
- [ ] Scripts npm funcionando (dev, build, start)
- [ ] Servidor rodando em http://localhost:3000
- [ ] Frontend rodando em http://localhost:5173

---

## 📁 Estrutura de Diretórios

Crie a seguinte estrutura EXATAMENTE como mostrado:

```
sistema-pedidos/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Conexão Prisma
│   │   │   └── socket.js            # Configuração Socket.io
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js              # Autenticação JWT
│   │   │   ├── errorHandler.js     # Tratamento de erros global
│   │   │   └── validateRequest.js   # Validação de inputs
│   │   │
│   │   ├── routes/
│   │   │   ├── index.js             # Agregador de rotas
│   │   │   ├── auth.routes.js       # Login/logout
│   │   │   ├── pedidos.routes.js    # CRUD pedidos
│   │   │   ├── mesas.routes.js      # CRUD mesas
│   │   │   ├── produtos.routes.js   # CRUD produtos/cardápio
│   │   │   ├── clientes.routes.js   # CRUD clientes
│   │   │   ├── usuarios.routes.js   # CRUD usuários/permissões
│   │   │   ├── estoque.routes.js    # Controle de estoque
│   │   │   └── dashboard.routes.js  # Endpoints de KPIs
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── pedidoController.js
│   │   │   ├── mesaController.js
│   │   │   ├── produtoController.js
│   │   │   ├── clienteController.js
│   │   │   ├── usuarioController.js
│   │   │   ├── estoqueController.js
│   │   │   └── dashboardController.js
│   │   │
│   │   ├── services/
│   │   │   ├── socketService.js     # Lógica WebSocket (eventos)
│   │   │   ├── printerService.js    # Integração impressora térmica
│   │   │   ├── backupService.js     # Backup automático Google Drive
│   │   │   └── kpiService.js        # Cálculos de KPIs
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js            # Winston para logs
│   │   │   ├── validators.js        # Funções de validação
│   │   │   └── dateHelpers.js       # Helpers de data/hora
│   │   │
│   │   └── server.js                # Entry point do backend
│   │
│   ├── prisma/
│   │   ├── schema.prisma            # Schema do banco de dados
│   │   ├── seed.js                  # Dados iniciais (admin padrão)
│   │   └── migrations/              # Histórico de migrações
│   │
│   ├── .env                         # Variáveis de ambiente (NÃO commitar)
│   ├── .env.example                 # Template de .env
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   ├── manifest.json            # PWA manifest
│   │   ├── icon-192.png             # Ícone PWA 192x192
│   │   ├── icon-512.png             # Ícone PWA 512x512
│   │   └── sounds/
│   │       ├── novo-pedido.mp3      # Som notificação novo pedido
│   │       └── pedido-pronto.mp3    # Som notificação pedido pronto
│   │
│   ├── src/
│   │   ├── assets/                  # Imagens, logos
│   │   │
│   │   ├── components/
│   │   │   ├── common/              # Componentes reutilizáveis
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   └── Loading.jsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Layout.jsx
│   │   │   │
│   │   │   └── features/            # Componentes específicos por feature
│   │   │       ├── pedidos/
│   │   │       ├── mesas/
│   │   │       ├── produtos/
│   │   │       └── dashboard/
│   │   │
│   │   ├── pages/
│   │   │   ├── Hub.jsx              # Página de seleção de função
│   │   │   ├── Login.jsx            # Página de login
│   │   │   ├── Atendente.jsx        # PWA para atendentes
│   │   │   ├── Cozinha.jsx          # Painel da cozinha
│   │   │   ├── Caixa.jsx            # Tela do caixa
│   │   │   ├── Admin.jsx            # Painel administrativo
│   │   │   ├── Dashboard.jsx        # Dashboard de KPIs
│   │   │   └── Estoque.jsx          # Controle de estoque
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js           # Hook de autenticação
│   │   │   ├── usePedidos.js        # Hook para pedidos (TanStack Query)
│   │   │   ├── useMesas.js
│   │   │   ├── useProdutos.js
│   │   │   ├── useClientes.js
│   │   │   ├── useSocket.js         # Hook WebSocket
│   │   │   └── useNotification.js   # Hook notificações sonoras
│   │   │
│   │   ├── services/
│   │   │   ├── api.js               # Axios configurado
│   │   │   └── socket.js            # Socket.io client configurado
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Context de autenticação
│   │   │   └── SocketContext.jsx    # Context WebSocket
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.js        # Formatação de moeda, data, etc
│   │   │   └── constants.js         # Constantes da aplicação
│   │   │
│   │   ├── styles/
│   │   │   └── globals.css          # Estilos globais + Tailwind
│   │   │
│   │   ├── App.jsx                  # Componente raiz
│   │   └── main.jsx                 # Entry point React
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env                         # Variáveis de ambiente frontend
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── docs/                            # Documentação do projeto
│   ├── README.md                    # README principal
│   ├── BUSINESS_RULES.md
│   ├── USER_STORIES.md
│   └── API_DOCUMENTATION.md
│
├── .gitignore                       # Gitignore global
└── README.md                        # README do monorepo
```

---

## 🔧 Backend - Setup Detalhado

### 1. Inicializar Backend

```bash
mkdir sistema-pedidos
cd sistema-pedidos
mkdir backend
cd backend
npm init -y
```

### 2. Instalar Dependências Backend

```bash
# Dependências principais
npm install express cors dotenv
npm install @prisma/client
npm install socket.io
npm install bcryptjs jsonwebtoken
npm install express-validator
npm install winston
npm install node-thermal-printer
npm install date-fns

# Dependências de desenvolvimento
npm install -D nodemon prisma
npm install -D eslint prettier
```

### 3. Configurar package.json (Backend)

Edite `backend/package.json` e adicione:

```json
{
  "name": "sistema-pedidos-backend",
  "version": "1.0.0",
  "description": "Backend do Sistema de Gestão de Pedidos",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "node prisma/seed.js",
    "lint": "eslint src/**/*.js",
    "format": "prettier --write src/**/*.js"
  },
  "keywords": ["pedidos", "restaurante", "gestao"],
  "author": "Seu Nome",
  "license": "MIT"
}
```

### 4. Criar Arquivo .env (Backend)

Crie `backend/.env`:

```env
# Servidor
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Banco de Dados
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=sua_chave_super_secreta_aqui_mude_em_producao
JWT_EXPIRES_IN=7d

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:5173

# Impressora (configurar depois)
PRINTER_INTERFACE=tcp://192.168.1.100
PRINTER_TYPE=EPSON

# Backup (configurar depois)
BACKUP_ENABLED=false
BACKUP_PATH=./backups
BACKUP_SCHEDULE=0 23 * * *

# Configurações do Sistema
TIMEZONE=America/Sao_Paulo
LOCALE=pt-BR
CURRENCY=BRL

# Alerta de Tempo (em minutos)
PEDIDO_ALERTA_TEMPO=30
```

### 5. Criar .env.example (Backend)

Copie o .env mas remova valores sensíveis:

```bash
cp backend/.env backend/.env.example
# Edite .env.example e remova JWT_SECRET e outros valores sensíveis
```

### 6. Criar .gitignore (Backend)

Crie `backend/.gitignore`:

```gitignore
# Dependências
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Ambiente
.env
.env.local
.env.*.local

# Banco de dados
*.db
*.db-journal
prisma/migrations/*
!prisma/migrations/.gitkeep

# Logs
logs/
*.log

# Backup
backups/

# Sistema operacional
.DS_Store
Thumbs.db

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# Build
dist/
build/
```

### 7. Criar Prisma Schema Inicial

Crie `backend/prisma/schema.prisma`:

```prisma
// Este é o schema INICIAL - será expandido nas próximas fases
// NÃO modifique este arquivo ainda, apenas crie-o

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Schema completo será definido em PHASE_01_DATABASE_SCHEMA.md
// Por enquanto, apenas estrutura básica para testar conexão

model Usuario {
  id        Int      @id @default(autoincrement())
  nome      String
  email     String   @unique
  senha     String
  ativo     Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 8. Inicializar Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 9. Criar Server.js Básico

Crie `backend/src/server.js`:

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configurar Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend funcionando!',
    version: '1.0.0'
  });
});

// WebSocket - Teste de conexão
io.on('connection', (socket) => {
  console.log(`✅ Cliente conectado: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
  
  // Evento de teste
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });
});

// Middleware de erro (básico)
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🍔 SISTEMA DE GESTÃO DE PEDIDOS                    ║
║                                                       ║
║   🚀 Servidor rodando em:                            ║
║      http://${HOST}:${PORT}                           ║
║                                                       ║
║   📡 WebSocket disponível                            ║
║   🗄️  Banco de dados: SQLite                         ║
║   🌍 Ambiente: ${process.env.NODE_ENV?.toUpperCase() || 'DEVELOPMENT'}                      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
```

---

## 🎨 Frontend - Setup Detalhado

### 1. Criar Frontend com Vite

```bash
cd ..  # Voltar para raiz do projeto
npm create vite@latest frontend -- --template react
cd frontend
```

### 2. Instalar Dependências Frontend

```bash
# Dependências principais
npm install react-router-dom
npm install @tanstack/react-query
npm install axios
npm install socket.io-client
npm install date-fns
npm install recharts
npm install lucide-react

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# PWA
npm install -D vite-plugin-pwa

# Desenvolvimento
npm install -D eslint prettier
```

### 3. Configurar Tailwind CSS

Edite `frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Laranja principal
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Verde secundário
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### 4. Configurar Vite

Edite `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Sistema de Pedidos',
        short_name: 'Pedidos',
        description: 'Sistema de gestão de pedidos para estabelecimentos',
        theme_color: '#f97316',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true
      }
    }
  }
})
```

### 5. Criar .env (Frontend)

Crie `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_APP_NAME=Sistema de Pedidos
VITE_APP_VERSION=1.0.0
```

### 6. Configurar Estilos Globais

Edite `frontend/src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold;
  }
}

@layer components {
  /* Componentes customizados serão adicionados nas próximas fases */
  .btn-primary {
    @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors;
  }
  
  .btn-secondary {
    @apply bg-secondary-500 text-white px-4 py-2 rounded-lg hover:bg-secondary-600 transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-4;
  }
}
```

### 7. Criar App.jsx Básico

Edite `frontend/src/App.jsx`:

```jsx
import { useState, useEffect } from 'react'
import './styles/globals.css'

function App() {
  const [status, setStatus] = useState('Verificando...')
  
  useEffect(() => {
    // Testar conexão com backend
    fetch('http://localhost:3000/api/test')
      .then(res => res.json())
      .then(data => {
        setStatus(`✅ Backend conectado: ${data.message}`)
      })
      .catch(err => {
        setStatus('❌ Erro ao conectar com backend')
        console.error(err)
      })
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">
          🍔 Sistema de Pedidos
        </h1>
        <p className="text-gray-600 mb-6">
          Fase 00 - Setup Completo
        </p>
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <p className="font-mono text-sm">{status}</p>
        </div>
        <div className="text-left space-y-2 text-sm text-gray-600">
          <p>✅ Frontend configurado (Vite + React)</p>
          <p>✅ Tailwind CSS ativo</p>
          <p>✅ PWA configurado</p>
          <p>✅ Proxy configurado</p>
        </div>
      </div>
    </div>
  )
}

export default App
```

### 8. Criar main.jsx

Edite `frontend/src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 9. Configurar package.json (Frontend)

Edite `frontend/package.json` e adicione:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx",
    "format": "prettier --write src/**/*.{js,jsx}"
  }
}
```

---

## ✅ Testes de Validação

### 1. Testar Backend

```bash
cd backend
npm run dev
```

**Esperado:**
- Servidor roda em http://localhost:3000
- Mensagem de boas-vindas aparece no terminal
- Acesse http://localhost:3000/health → deve retornar JSON com status OK

### 2. Testar Frontend

```bash
# Em outro terminal
cd frontend
npm run dev
```

**Esperado:**
- Frontend roda em http://localhost:5173
- Página mostra "Backend conectado"
- Estilos Tailwind funcionando
- Console sem erros

### 3. Testar WebSocket

Abra DevTools do navegador no frontend e cole no console:

```javascript
const socket = io('http://localhost:3000');
socket.on('connect', () => console.log('✅ Socket conectado!'));
socket.emit('ping');
socket.on('pong', (data) => console.log('🏓 Pong recebido:', data));
```

**Esperado:** Mensagens de conexão no console

---

## 📋 Checklist Final da Fase 00

Antes de prosseguir para PHASE_01, confirme:

- [ ] Backend roda sem erros
- [ ] Frontend roda sem erros
- [ ] Endpoint /health retorna 200 OK
- [ ] Endpoint /api/test retorna JSON
- [ ] WebSocket conecta (veja logs do backend)
- [ ] Prisma está configurado e migrations rodaram
- [ ] Tailwind CSS está aplicado no frontend
- [ ] Estrutura de diretórios completa criada
- [ ] Git inicializado (opcional mas recomendado)

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'express'"
**Solução:** Execute `npm install` dentro da pasta backend

### Erro: "Port 3000 already in use"
**Solução:** Mude a porta no .env ou mate o processo:
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

### Frontend não conecta no backend
**Solução:** Verifique se proxy está configurado no vite.config.js

### Prisma não gera client
**Solução:** Execute `npx prisma generate` manualmente

---

## 🎯 Próxima Fase

**PHASE_01_DATABASE_SCHEMA.md** - Modelagem completa do banco de dados com TODAS as tabelas e relacionamentos necessários.

---

## 📝 Notas para Claude Opus 4.5

- Esta fase deve ser executada PRIMEIRO antes de qualquer outra
- Siga a estrutura de diretórios EXATAMENTE como especificado
- Teste cada etapa antes de prosseguir
- Se algum comando falhar, investigue antes de continuar
- O Prisma schema aqui é simplificado propositalmente - será expandido na PHASE_01
- Mantenha os nomes de arquivos e pastas em inglês (padrão da indústria)
- Use módulos ES6 (import/export) em vez de CommonJS
- Todo código deve ter tratamento de erros básico

---

**Status:** ✅ Pronto para execução  
**Tempo estimado:** 30-45 minutos  
**Complexidade:** Baixa  
**Dependências:** Nenhuma (fase inicial)