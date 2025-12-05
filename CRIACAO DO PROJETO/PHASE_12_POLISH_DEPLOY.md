# 🚀 PHASE 12 - POLISH & DEPLOY

## 📌 Objetivo desta Fase
Finalizar o sistema com otimizações, configurações de produção, documentação completa e preparação para deploy em ambiente real.

---

## ✅ Checklist de Conclusão
Ao final desta fase, você deve ter:
- [ ] Variáveis de ambiente configuradas
- [ ] Build de produção otimizado
- [ ] Service Worker configurado (PWA)
- [ ] Manifest.json completo
- [ ] Favicon e ícones PWA
- [ ] Loading states refinados
- [ ] Tratamento de erros global
- [ ] Validações adicionais
- [ ] README.md completo
- [ ] Documentação de API
- [ ] Scripts de deploy
- [ ] Configuração de CORS
- [ ] Segurança reforçada
- [ ] Performance otimizada

---

## 📁 Arquivos que Serão Criados/Atualizados

```
projeto/
├── frontend/
│   ├── .env.production          🆕 Variáveis de produção
│   ├── .env.example             🆕 Template de variáveis
│   ├── public/
│   │   ├── manifest.json        🔄 Atualizar
│   │   ├── robots.txt           🆕 SEO
│   │   └── icons/               🆕 Ícones PWA
│   ├── vite.config.js           🔄 Otimizações
│   └── package.json             🔄 Scripts deploy
│
├── backend/
│   ├── .env.production          🆕 Variáveis de produção
│   ├── .env.example             🆕 Template
│   ├── src/
│   │   └── config/
│   │       └── cors.js          🆕 Configuração CORS
│   └── package.json             🔄 Scripts deploy
│
├── README.md                    🆕 Documentação principal
├── DEPLOY.md                    🆕 Guia de deploy
├── API_DOCS.md                  🆕 Documentação da API
├── .gitignore                   🔄 Atualizar
└── docker-compose.yml           🆕 Opcional (Docker)
```

---

## 🔧 1. VARIÁVEIS DE AMBIENTE

### Frontend - `.env.example`

Crie `frontend/.env.example`:

```env
# API
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# App
VITE_APP_NAME=Sistema de Pedidos
VITE_APP_VERSION=1.0.0

# Features (opcional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false
```

### Frontend - `.env.production`

Crie `frontend/.env.production`:

```env
# API (ajustar para seu domínio)
VITE_API_URL=https://api.seudominio.com/api
VITE_SOCKET_URL=https://api.seudominio.com

# App
VITE_APP_NAME=Sistema de Pedidos
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
```

### Backend - `.env.example`

Crie `backend/.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=seu-secret-super-secreto-mude-isso

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Upload (opcional)
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Backend - `.env.production`

Crie `backend/.env.production`:

```env
# Server
PORT=3000
NODE_ENV=production

# Database (ajustar conforme banco)
DATABASE_URL="file:./prod.db"
# Para PostgreSQL: DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT (GERAR NOVO SECRET!)
JWT_SECRET=GERAR_UM_SECRET_FORTE_AQUI_USE_OPENSSL

# CORS (seu domínio frontend)
ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

**IMPORTANTE:** Gerar JWT_SECRET forte:
```bash
openssl rand -base64 64
```

---

## ⚙️ 2. OTIMIZAÇÕES VITE

Atualize `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'Sistema de Gestão de Pedidos',
        short_name: 'Pedidos',
        description: 'Sistema completo de gestão de pedidos para restaurantes',
        theme_color: '#f97316',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.seudominio\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300, // 5 minutos
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false, // Desabilitar em produção
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.logs
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          query: ['@tanstack/react-query'],
          forms: ['date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 🔒 3. CONFIGURAÇÃO CORS (Backend)

Crie `backend/src/config/cors.js`:

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqueado para origem: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 horas
};

module.exports = corsOptions;
```

Atualize `backend/src/index.js` para usar:

```javascript
const cors = require('cors');
const corsOptions = require('./config/cors');

// ... resto do código

app.use(cors(corsOptions));
```

---

## 🎨 4. MANIFEST.JSON COMPLETO

Atualize `frontend/public/manifest.json`:

```json
{
  "name": "Sistema de Gestão de Pedidos",
  "short_name": "Pedidos",
  "description": "Sistema completo de gestão de pedidos para restaurantes com controle de estoque, cozinha em tempo real e dashboard analítico",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f97316",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "productivity", "food"],
  "screenshots": [
    {
      "src": "/screenshots/screenshot1.png",
      "sizes": "540x720",
      "type": "image/png"
    }
  ]
}
```

---

## 🤖 5. ROBOTS.TXT

Crie `frontend/public/robots.txt`:

```txt
User-agent: *
Disallow: /admin
Disallow: /api

Sitemap: https://seudominio.com/sitemap.xml
```

---

## 📦 6. SCRIPTS DE DEPLOY

Atualize `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:prod": "NODE_ENV=production vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx",
    "format": "prettier --write \"src/**/*.{js,jsx,json,css}\"",
    "analyze": "vite build --mode analyze"
  }
}
```

Atualize `backend/package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:seed": "node prisma/seed.js",
    "prisma:studio": "prisma studio",
    "deploy": "npm run prisma:generate && npm run prisma:migrate && npm start"
  }
}
```

---

## 🐳 7. DOCKER (OPCIONAL)

Crie `docker-compose.yml` na raiz:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./prod.db
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3000
    volumes:
      - ./backend/prisma:/app/prisma
      - backend-data:/app/data
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  backend-data:
```

Crie `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
```

Crie `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Crie `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

---

## 🔒 8. SEGURANÇA ADICIONAL

Crie `backend/src/middleware/rateLimiter.js`:

```javascript
const rateLimit = require('express-rate-limit');

// Rate limiter para login (mais restritivo)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter geral para API
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requisições por minuto
  message: 'Muitas requisições. Tente novamente em breve.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, apiLimiter };
```

Instalar e usar:
```bash
cd backend
npm install express-rate-limit
```

Em `backend/src/index.js`:
```javascript
const { loginLimiter, apiLimiter } = require('./middleware/rateLimiter');

// Aplicar rate limiter
app.use('/api', apiLimiter);
app.post('/api/auth/login', loginLimiter, authController.login);
```

---

## 📊 9. TRATAMENTO DE ERROS GLOBAL

Crie `backend/src/middleware/errorHandler.js`:

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro:', err);

  // Erro de validação do Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({
      error: 'Já existe um registro com esses dados',
      field: err.meta?.target?.[0],
    });
  }

  // Erro de registro não encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Registro não encontrado',
    });
  }

  // Erro de autenticação
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido ou expirado',
    });
  }

  // Erro padrão
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
```

Adicionar em `backend/src/index.js`:
```javascript
const errorHandler = require('./middleware/errorHandler');

// ... rotas

// Handler de erros (sempre por último)
app.use(errorHandler);
```

---

## 🔍 10. LOGGING MELHORADO

Crie `backend/src/utils/logger.js`:

```javascript
const logger = {
  info: (message, ...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`ℹ️  [INFO] ${message}`, ...args);
    }
  },
  
  success: (message, ...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`✅ [SUCCESS] ${message}`, ...args);
    }
  },
  
  warn: (message, ...args) => {
    console.warn(`⚠️  [WARN] ${message}`, ...args);
  },
  
  error: (message, ...args) => {
    console.error(`❌ [ERROR] ${message}`, ...args);
  },
};

module.exports = logger;
```

---

**CONTINUA NA PRÓXIMA MENSAGEM...**

Vou criar a Parte 2 com documentação completa (README, API_DOCS, DEPLOY).

# 🚀 PHASE 12 - POLISH & DEPLOY (PARTE 2 - DOCUMENTAÇÃO)

## 📚 Documentação Completa do Projeto

---

## 📝 11. README.md (Raiz do Projeto)

Crie `README.md`:

```markdown
# 🍔 Sistema de Gestão de Pedidos

Sistema completo de gestão de pedidos para restaurantes com controle em tempo real, dashboard analítico, gerenciamento de estoque e mais.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![React](https://img.shields.io/badge/react-18-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Funcionalidades

### Operação
- ✅ **Atendente**: Criação de pedidos com seleção de mesa, produtos e clientes
- ✅ **Cozinha**: Painel em tempo real para preparação de pedidos
- ✅ **Caixa**: Finalização de pagamentos e liberação de mesas

### Administração
- ✅ **CRUD Produtos**: Gerenciamento completo de produtos e categorias
- ✅ **CRUD Mesas**: Configuração de mesas e capacidades
- ✅ **CRUD Usuários**: Gerenciamento de usuários e permissões
- ✅ **Controle de Estoque**: Entrada, saída e ajustes manuais

### Análise
- ✅ **Dashboard**: KPIs, gráficos e comparativos de períodos
- ✅ **Relatórios**: Top produtos, clientes VIP, horários de pico

### Tecnologias
- ✅ **WebSocket**: Atualizações em tempo real
- ✅ **PWA**: Funciona offline, instalável em dispositivos
- ✅ **Responsivo**: Desktop, tablet e mobile
- ✅ **Multi-usuário**: Sistema de grupos e permissões

## 🛠️ Stack Tecnológica

### Backend
- **Node.js** + Express
- **Prisma ORM** + SQLite (pode usar PostgreSQL)
- **Socket.io** para WebSocket
- **JWT** para autenticação
- **bcrypt** para senhas

### Frontend
- **React 18** + Vite
- **TailwindCSS** para estilização
- **TanStack Query** para cache
- **Recharts** para gráficos
- **date-fns** para datas
- **Socket.io-client** para WebSocket

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Git

## 🚀 Instalação

### 1. Clone o repositório

\`\`\`bash
git clone https://github.com/seu-usuario/sistema-pedidos.git
cd sistema-pedidos
\`\`\`

### 2. Backend

\`\`\`bash
cd backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Gerar Prisma Client
npx prisma generate

# Rodar migrações
npx prisma migrate dev

# Popular banco com dados de exemplo
npm run seed

# Iniciar servidor
npm run dev
\`\`\`

Servidor rodando em: http://localhost:3000

### 3. Frontend

\`\`\`bash
cd frontend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Iniciar aplicação
npm run dev
\`\`\`

Aplicação rodando em: http://localhost:5173

## 👤 Login Padrão

Após rodar o seed, você pode fazer login com:

| Usuário | Email | Senha | Grupo |
|---------|-------|-------|-------|
| Admin | admin@sistema.com | admin123 | Admin |
| Gerente | gerente@sistema.com | gerente123 | Gerente |
| Atendente | atendente@sistema.com | atendente123 | Atendente |
| Cozinha | cozinha@sistema.com | cozinha123 | Cozinha |
| Caixa | caixa@sistema.com | caixa123 | Caixa |

⚠️ **IMPORTANTE**: Altere as senhas em produção!

## 📱 PWA (Progressive Web App)

O sistema pode ser instalado como aplicativo:

1. Acesse pelo navegador (Chrome/Edge/Safari)
2. Clique no ícone de instalação na barra de endereço
3. Confirme a instalação
4. Use como app nativo!

## 🔒 Permissões

O sistema possui 18 permissões diferentes organizadas em 5 grupos:

- **Admin**: Acesso total
- **Gerente**: Administração exceto usuários
- **Atendente**: Criar pedidos, ver mesas
- **Cozinha**: Ver e preparar pedidos
- **Caixa**: Finalizar pagamentos

## 📊 Estrutura do Banco de Dados

12 tabelas principais:
- usuarios, grupos, permissoes
- clientes, mesas, produtos, categorias
- pedidos, itens_pedido
- movimentacoes_estoque
- logs

## 🧪 Testes

\`\`\`bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
\`\`\`

## 📦 Build para Produção

### Backend

\`\`\`bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm start
\`\`\`

### Frontend

\`\`\`bash
cd frontend
npm run build

# Servir com servidor estático
npm run preview
\`\`\`

## 🐳 Docker

\`\`\`bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
\`\`\`

## 📖 Documentação Adicional

- [API Documentation](./API_DOCS.md)
- [Deploy Guide](./DEPLOY.md)
- [Architecture](./docs/ARCHITECTURE.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: \`git checkout -b feature/nova-funcionalidade\`
3. Commit: \`git commit -m 'Adiciona nova funcionalidade'\`
4. Push: \`git push origin feature/nova-funcionalidade\`
5. Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ por [Seu Nome]

## 📞 Suporte

- Email: suporte@seudominio.com
- Issues: [GitHub Issues](https://github.com/seu-usuario/sistema-pedidos/issues)

## 🗺️ Roadmap

- [ ] Integração com impressora térmica
- [ ] Backup automático
- [ ] App mobile nativo (React Native)
- [ ] Integração com pagamento online
- [ ] Sistema de delivery
- [ ] Comandas digitais

---

**⭐ Se este projeto foi útil, considere dar uma estrela!**
\`\`\`

---

## 📚 12. API_DOCS.md

Crie `API_DOCS.md`:

```markdown
# 📡 Documentação da API

Base URL: `http://localhost:3000/api`

## 🔐 Autenticação

Todas as rotas (exceto login) requerem token JWT no header:

\`\`\`
Authorization: Bearer SEU_TOKEN_AQUI
\`\`\`

### POST /auth/login

Login de usuário.

**Body:**
\`\`\`json
{
  "email": "admin@sistema.com",
  "senha": "admin123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Admin",
    "email": "admin@sistema.com",
    "grupo": {
      "id": 1,
      "nome": "Admin"
    }
  }
}
\`\`\`

### GET /auth/verificar

Verificar token JWT.

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
\`\`\`json
{
  "valido": true,
  "usuario": { ... }
}
\`\`\`

---

## 👥 Usuários

### GET /usuarios

Listar usuários.

**Query params:**
- `ativo` (boolean): Filtrar por status

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "nome": "Admin",
    "sobrenome": "Sistema",
    "email": "admin@sistema.com",
    "telefone": null,
    "ativo": true,
    "grupoId": 1,
    "grupo": { "id": 1, "nome": "Admin" }
  }
]
\`\`\`

### POST /usuarios

Criar usuário.

**Body:**
\`\`\`json
{
  "nome": "João",
  "sobrenome": "Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "telefone": "(11) 99999-9999",
  "grupoId": 3,
  "ativo": true
}
\`\`\`

### PUT /usuarios/:id

Atualizar usuário.

### GET /usuarios/grupos

Listar grupos disponíveis.

---

## 🍔 Produtos

### GET /produtos

Listar produtos.

**Query params:**
- `categoriaId` (number)
- `disponivel` (boolean)
- `estoque` (boolean)
- `busca` (string)

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "nome": "Hambúrguer Clássico",
    "descricao": "Pão, carne, queijo",
    "preco": 25.90,
    "categoriaId": 1,
    "disponivel": true,
    "estoque": true,
    "quantidadeEstoque": 50,
    "estoqueMinimo": 10,
    "categoria": {
      "id": 1,
      "nome": "Lanches"
    }
  }
]
\`\`\`

### POST /produtos

Criar produto.

### PUT /produtos/:id

Atualizar produto.

### DELETE /produtos/:id

Excluir produto.

### GET /produtos/categorias

Listar categorias.

### POST /produtos/categorias/criar

Criar categoria.

---

## 🪑 Mesas

### GET /mesas

Listar mesas.

**Query params:**
- `status` (livre|ocupada)

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "numero": 1,
    "capacidade": 4,
    "status": "livre",
    "localizacao": "Salão principal",
    "ativa": true
  }
]
\`\`\`

### POST /mesas

Criar mesa.

### PUT /mesas/:id

Atualizar mesa.

### DELETE /mesas/:id

Excluir mesa.

---

## 📦 Pedidos

### GET /pedidos

Listar pedidos.

**Query params:**
- `status` (preparando|pronto|entregue|pago|cancelado)
- `mesaId` (number)
- `dataInicio` (date)
- `dataFim` (date)

**Response:**
\`\`\`json
{
  "pedidos": [
    {
      "id": 1,
      "numero": 1,
      "mesaId": 1,
      "clienteId": 1,
      "status": "preparando",
      "subtotal": 50.00,
      "desconto": 0,
      "total": 50.00,
      "observacao": null,
      "criadoEm": "2025-01-15T10:30:00Z",
      "mesa": { "numero": 1 },
      "cliente": { "nome": "João", "sobrenome": "Silva" },
      "itens": [
        {
          "id": 1,
          "produtoId": 1,
          "quantidade": 2,
          "precoUnitario": 25.00,
          "subtotal": 50.00,
          "observacao": "Sem cebola",
          "produto": { "nome": "Hambúrguer" }
        }
      ]
    }
  ],
  "total": 1,
  "pagina": 1,
  "limite": 10
}
\`\`\`

### POST /pedidos

Criar pedido.

**Body:**
\`\`\`json
{
  "mesaId": 1,
  "clienteId": 1,
  "observacao": "Entregar rápido",
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2,
      "observacao": "Sem cebola"
    }
  ]
}
\`\`\`

### PATCH /pedidos/:id/status

Atualizar status do pedido.

**Body:**
\`\`\`json
{
  "status": "pronto"
}
\`\`\`

### DELETE /pedidos/:id

Cancelar pedido.

**Body:**
\`\`\`json
{
  "motivo": "Cliente desistiu"
}
\`\`\`

---

## 📊 Dashboard

### GET /dashboard/kpis

KPIs gerais.

**Query params:**
- `periodo` (hoje|ontem|semana|mes)

**Response:**
\`\`\`json
{
  "faturamento": 1234.56,
  "ticketMedio": 45.67,
  "totalPedidos": 27,
  "novosClientes": 8,
  "tempoMedioPreparo": 18,
  "taxaOcupacao": 65.5,
  "produtoMaisVendido": {
    "nome": "Hambúrguer",
    "quantidade": 45
  }
}
\`\`\`

---

## 📦 Estoque

### GET /estoque/movimentacoes

Listar movimentações.

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "tipo": "entrada",
    "produtoId": 1,
    "quantidade": 50,
    "fornecedor": "Fornecedor XYZ",
    "numeroNota": "123456",
    "valorUnitario": 10.50,
    "observacao": "Compra mensal",
    "criadoEm": "2025-01-15T09:00:00Z",
    "usuario": { "nome": "Admin" },
    "produto": { "nome": "Hambúrguer" }
  }
]
\`\`\`

### POST /estoque/movimentacao

Criar movimentação (entrada/saída).

**Body:**
\`\`\`json
{
  "tipo": "entrada",
  "produtoId": 1,
  "quantidade": 50,
  "fornecedor": "Fornecedor XYZ",
  "numeroNota": "123456",
  "valorUnitario": 10.50,
  "observacao": "Compra mensal"
}
\`\`\`

### POST /estoque/ajuste/:produtoId

Ajustar estoque manualmente.

**Body:**
\`\`\`json
{
  "quantidade": 30,
  "motivo": "inventario"
}
\`\`\`

### GET /estoque/alertas

Produtos com estoque baixo.

---

## 🔍 Clientes

### GET /clientes/buscar-telefone

Buscar cliente por telefone.

**Query params:**
- `telefone` (string)

### POST /clientes

Criar ou atualizar cliente.

### GET /clientes/top/ranking

Top clientes por gasto.

---

## ⚠️ Códigos de Status

- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `500` Internal Server Error

## 🔒 Permissões Necessárias

Cada rota verifica permissões específicas:

| Rota | Permissão |
|------|-----------|
| POST /pedidos | criar_pedido |
| PATCH /pedidos/:id/status | marcar_pronto |
| POST /produtos | gerenciar_produtos |
| POST /usuarios | gerenciar_usuarios |
| GET /dashboard/kpis | ver_dashboard |

---

**Para mais detalhes, consulte o código fonte em `backend/src/controllers/`**
\`\`\`

---

**CONTINUA NA PRÓXIMA MENSAGEM...**

Vou criar a Parte 3 final com DEPLOY.md, .gitignore e checklist completo.

# 🚀 PHASE 12 - POLISH & DEPLOY (PARTE 3 - DEPLOY & FINAL)

## 🌐 Guia Completo de Deploy

---

## 📖 13. DEPLOY.md

Crie `DEPLOY.md`:

```markdown
# 🚀 Guia de Deploy

Este guia cobre diferentes opções de deploy para o sistema.

## 📋 Pré-requisitos

- Servidor com Node.js 18+
- Domínio configurado (opcional mas recomendado)
- Certificado SSL (Let's Encrypt grátis)
- Git instalado no servidor

---

## 🖥️ Opção 1: VPS (DigitalOcean, Linode, AWS EC2)

### 1. Preparar Servidor

\`\`\`bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Instalar Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
\`\`\`

### 2. Clonar Repositório

\`\`\`bash
cd /var/www
sudo git clone https://github.com/seu-usuario/sistema-pedidos.git
cd sistema-pedidos
\`\`\`

### 3. Configurar Backend

\`\`\`bash
cd backend

# Instalar dependências
npm ci --only=production

# Configurar .env de produção
sudo nano .env

# Copiar conteúdo de .env.production
# IMPORTANTE: Gerar novo JWT_SECRET!

# Prisma
npx prisma generate
npx prisma migrate deploy
npm run seed

# Iniciar com PM2
pm2 start src/index.js --name "backend-pedidos"
pm2 startup
pm2 save
\`\`\`

### 4. Configurar Frontend

\`\`\`bash
cd ../frontend

# Instalar dependências
npm ci

# Configurar .env.production
sudo nano .env.production
# Ajustar VITE_API_URL com seu domínio

# Build
npm run build

# Arquivos estão em /dist
\`\`\`

### 5. Configurar Nginx

\`\`\`bash
sudo nano /etc/nginx/sites-available/sistema-pedidos
\`\`\`

Adicionar:

\`\`\`nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    # Frontend
    root /var/www/sistema-pedidos/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
\`\`\`

Ativar site:

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/sistema-pedidos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

### 6. Configurar SSL (Let's Encrypt)

\`\`\`bash
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
\`\`\`

### 7. Firewall

\`\`\`bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
\`\`\`

---

## 🐳 Opção 2: Docker

### 1. Build e Deploy

\`\`\`bash
# Criar .env com variáveis de produção
cp .env.example .env

# Build e subir
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
\`\`\`

### 2. Backup do Banco

\`\`\`bash
docker-compose exec backend npm run backup
\`\`\`

---

## ☁️ Opção 3: Vercel (Frontend) + Railway (Backend)

### Frontend no Vercel

1. Push código para GitHub
2. Conectar repositório no Vercel
3. Configurar:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`
4. Adicionar variáveis de ambiente
5. Deploy!

### Backend no Railway

1. Conectar repositório no Railway
2. Selecionar pasta `backend`
3. Adicionar variáveis de ambiente
4. Railway detecta Node.js automaticamente
5. Deploy!

---

## 🔄 Atualização de Produção

### VPS/PM2

\`\`\`bash
cd /var/www/sistema-pedidos

# Pull código novo
git pull origin main

# Backend
cd backend
npm ci --only=production
npx prisma migrate deploy
pm2 restart backend-pedidos

# Frontend
cd ../frontend
npm ci
npm run build
sudo systemctl restart nginx
\`\`\`

### Docker

\`\`\`bash
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
\`\`\`

---

## 📊 Monitoramento

### PM2 Monitoring

\`\`\`bash
pm2 monit
pm2 logs backend-pedidos
pm2 status
\`\`\`

### Logs do Sistema

\`\`\`bash
# Nginx
sudo tail -f /var/log/nginx/error.log

# PM2
pm2 logs backend-pedidos --lines 100
\`\`\`

---

## 🔐 Segurança

### Checklist

- [ ] Senhas padrão alteradas
- [ ] JWT_SECRET forte e único
- [ ] SSL/HTTPS configurado
- [ ] Firewall ativo
- [ ] Backups automáticos
- [ ] Rate limiting ativo
- [ ] CORS configurado corretamente
- [ ] Logs sendo monitorados

### Backup Automático

Criar script `backup.sh`:

\`\`\`bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/sistema-pedidos"

mkdir -p $BACKUP_DIR

# Backup do banco
cp /var/www/sistema-pedidos/backend/prisma/prod.db $BACKUP_DIR/db_$DATE.db

# Manter últimos 7 dias
find $BACKUP_DIR -name "db_*.db" -mtime +7 -delete

echo "Backup concluído: db_$DATE.db"
\`\`\`

Agendar com cron:

\`\`\`bash
sudo crontab -e

# Adicionar linha (backup diário às 3h)
0 3 * * * /path/to/backup.sh
\`\`\`

---

## 🐛 Troubleshooting

### Backend não inicia

\`\`\`bash
pm2 logs backend-pedidos
# Verificar .env
# Verificar permissões do banco
\`\`\`

### Frontend mostra 404 em rotas

Verificar Nginx try_files está configurado.

### WebSocket não conecta

Verificar proxy_pass do Nginx para /socket.io.

### CORS errors

Verificar ALLOWED_ORIGINS no .env do backend.

---

## 📞 Suporte

Em caso de problemas:
1. Verificar logs (PM2 e Nginx)
2. Consultar documentação
3. Abrir issue no GitHub

---

**Deploy completo! 🎉**
\`\`\`

---

## 🚫 14. .gitignore (Atualizado)

Crie/atualize `.gitignore` na raiz:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Production
dist/
build/
*.log

# Environment
.env
.env.local
.env.production
.env.*.local

# Database
*.db
*.db-journal
*.sqlite
*.sqlite3
migrations/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# OS
Thumbs.db

# Uploads
uploads/
temp/

# PM2
.pm2/

# Cache
.cache/
.parcel-cache/

# Misc
.turbo/
tsconfig.tsbuildinfo
```

---

## ✅ 15. CHECKLIST FINAL DE PRODUÇÃO

### Segurança

- [ ] Todas as senhas padrão alteradas
- [ ] JWT_SECRET gerado com openssl (64+ caracteres)
- [ ] HTTPS/SSL configurado (Let's Encrypt)
- [ ] CORS configurado com domínios corretos
- [ ] Rate limiting ativo no backend
- [ ] Headers de segurança configurados
- [ ] Firewall ativo (ufw)
- [ ] Logs sendo salvos e monitorados

### Performance

- [ ] Build de produção otimizado (Vite)
- [ ] Console.logs removidos (terser)
- [ ] Gzip habilitado (Nginx)
- [ ] Cache configurado (Service Worker)
- [ ] Imagens otimizadas
- [ ] Code splitting ativo (Vite)
- [ ] Database com índices necessários

### Funcionalidade

- [ ] Todas as features testadas
- [ ] WebSocket funcionando
- [ ] PWA instalável
- [ ] Responsividade em mobile/tablet/desktop
- [ ] Permissões funcionando corretamente
- [ ] Validações client e server-side
- [ ] Tratamento de erros global

### Deploy

- [ ] Backend rodando (PM2 ou Docker)
- [ ] Frontend servido (Nginx ou CDN)
- [ ] SSL válido e renovação automática
- [ ] Backup automático configurado
- [ ] Domínio apontado corretamente
- [ ] Monitoramento ativo (PM2 monit)
- [ ] Logs acessíveis

### Documentação

- [ ] README.md completo
- [ ] API_DOCS.md atualizado
- [ ] DEPLOY.md com instruções
- [ ] .env.example atualizado
- [ ] Comentários no código crítico

### Pós-Deploy

- [ ] Teste de login
- [ ] Teste de criar pedido completo
- [ ] Teste de WebSocket (cozinha)
- [ ] Teste de finalização (caixa)
- [ ] Teste de CRUD admin
- [ ] Teste de estoque
- [ ] Teste de dashboard
- [ ] Teste em mobile real
- [ ] Teste de instalação PWA

---

## 🎉 16. CELEBRAÇÃO - PROJETO 100% COMPLETO!

### 🏆 O QUE FOI CONSTRUÍDO

**13 FASES CONCLUÍDAS:**

| # | Fase | Linhas de Código | Arquivos | Complexidade |
|---|------|------------------|----------|--------------|
| 00 | Setup | ~500 | 15 | Baixa |
| 01 | Database | ~800 | 5 | Média |
| 02 | Backend | ~3000 | 40+ | Alta |
| 03 | Auth Frontend | ~800 | 10 | Média |
| 04 | Hub & Login | ~600 | 8 | Baixa |
| 05 | Atendente | ~1200 | 12 | Alta |
| 06 | Cozinha | ~1000 | 10 | Alta |
| 07 | Caixa | ~900 | 8 | Média |
| 08 | Admin | ~2000 | 15 | Alta |
| 09 | Dashboard | ~1500 | 10 | Média |
| 10 | Estoque | ~1200 | 10 | Média |
| 11 | ❌ Impressora | - | - | Pulada |
| 12 | Deploy | ~1000 | 20+ | Média |

**TOTAL:** ~14.500 linhas de código | 150+ arquivos

---

### 🎯 FUNCIONALIDADES ENTREGUES

#### ✅ Operação Completa
- Atendente: Criação de pedidos
- Cozinha: Preparação em tempo real
- Caixa: Finalização e pagamento
- WebSocket: Sincronização instantânea

#### ✅ Administração Completa
- CRUD Produtos (com categorias)
- CRUD Mesas (configuração)
- CRUD Usuários (com grupos)
- Controle de Estoque (entrada/saída/ajuste)

#### ✅ Análise e Relatórios
- Dashboard com 8 KPIs
- 4 gráficos interativos (Recharts)
- Top 10 produtos e clientes
- Comparativo de períodos

#### ✅ Recursos Técnicos
- PWA (instalável, offline-ready)
- Multi-usuário (5 grupos, 18 permissões)
- Responsivo (mobile/tablet/desktop)
- Segurança (JWT, bcrypt, rate limiting)
- Performance (code splitting, cache)

---

### 📊 ESTATÍSTICAS DO PROJETO

**Backend:**
- 40+ endpoints REST
- 12 tabelas no banco
- 5 controllers principais
- WebSocket para tempo real
- Sistema completo de logs

**Frontend:**
- 7 páginas principais
- 50+ componentes reutilizáveis
- 15+ hooks customizados
- TanStack Query para cache
- Design system completo

**Tempo Total Estimado:** 60-80 horas de desenvolvimento

---

### 🚀 SISTEMA PRONTO PARA

✅ **Uso Imediato:**
- Restaurantes pequenos/médios
- Lanchonetes
- Food trucks
- Bares e cafeterias

✅ **Ambientes:**
- Desenvolvimento local
- Servidor VPS (DigitalOcean, AWS)
- Docker containers
- Cloud (Vercel + Railway)

✅ **Dispositivos:**
- Desktop (Windows/Mac/Linux)
- Tablets (iPad, Android)
- Smartphones (como PWA)

---

### 🎓 TECNOLOGIAS DOMINADAS

**Backend:**
- Node.js + Express
- Prisma ORM
- Socket.io
- JWT Authentication
- bcrypt
- SQLite (migratável para PostgreSQL)

**Frontend:**
- React 18 + Hooks
- Vite
- TailwindCSS
- TanStack Query
- Recharts
- date-fns
- Socket.io-client

**DevOps:**
- PM2
- Nginx
- Docker
- Let's Encrypt SSL
- Backups automatizados

---

### 📈 POSSÍVEIS EVOLUÇÕES

**Curto Prazo:**
- [ ] Integração com impressora térmica
- [ ] Backup automático para cloud
- [ ] Notificações push

**Médio Prazo:**
- [ ] App mobile nativo (React Native)
- [ ] Sistema de delivery
- [ ] Integração com pagamento online
- [ ] Comandas digitais (QR Code)

**Longo Prazo:**
- [ ] Multi-restaurante (SaaS)
- [ ] IA para previsão de estoque
- [ ] Análise de sentimento (reviews)
- [ ] Integração com iFood/Rappi

---

## 🏁 CONCLUSÃO

### ✨ VOCÊ TEM AGORA:

1. ✅ **Sistema Profissional Completo**
   - Pronto para produção
   - Código limpo e organizado
   - Documentação completa

2. ✅ **Arquitetura Moderna**
   - RESTful API
   - WebSocket tempo real
   - PWA instalável
   - Responsivo

3. ✅ **Segurança Implementada**
   - Autenticação JWT
   - Permissões granulares
   - Rate limiting
   - HTTPS/SSL

4. ✅ **Pronto para Escalar**
   - Código modular
   - Fácil manutenção
   - Docker ready
   - Documentado

---

## 🎊 PARABÉNS!

Você completou **100% do projeto**! 

Este é um sistema real, profissional e pronto para uso comercial.

**Próximos Passos Sugeridos:**

1. 🚀 Fazer deploy em produção
2. 📱 Testar em dispositivos reais
3. 👥 Coletar feedback de usuários
4. 🔧 Implementar melhorias baseadas no uso
5. 📈 Expandir funcionalidades (roadmap)

---

## 🌟 APROVEITE SEU SISTEMA!

**E não esqueça de:**
- ⭐ Dar uma estrela no GitHub
- 📢 Compartilhar com a comunidade
- 💼 Usar em projetos comerciais
- 🤝 Contribuir com melhorias

---

**Sistema 100% Completo - Pronto para o Mundo Real! 🎉🚀**

*Desenvolvido com ❤️ e muita dedicação*
\`\`\`

---

## 🎯 PHASE 12 COMPLETA - PROJETO 100% FINALIZADO!

### Arquivos Criados nesta Fase:

1. ✅ `.env.example` (frontend e backend)
2. ✅ `.env.production` (frontend e backend)
3. ✅ `vite.config.js` (otimizado)
4. ✅ `cors.js` (configuração)
5. ✅ `rateLimiter.js` (segurança)
6. ✅ `errorHandler.js` (tratamento global)
7. ✅ `logger.js` (logs melhorados)
8. ✅ `manifest.json` (PWA completo)
9. ✅ `robots.txt` (SEO)
10. ✅ `docker-compose.yml` (opcional)
11. ✅ `Dockerfile` (frontend e backend)
12. ✅ `nginx.conf` (proxy)
13. ✅ `README.md` (documentação)
14. ✅ `API_DOCS.md` (API)
15. ✅ `DEPLOY.md` (guia deploy)
16. ✅ `.gitignore` (atualizado)
17. ✅ `backup.sh` (script backup)
18. ✅ Scripts npm (build, deploy)

---

**🏆 CONQUISTA DESBLOQUEADA: PROJETO 100% COMPLETO! 🏆**

