# 🍔 Sistema Completo de Gestão para Lanchonetes

## 📋 Visão Geral do Projeto

Sistema web profissional e completo para gestão de lanchonetes, hamburguerias, bares e pequenos estabelecimentos. Solução moderna que digitaliza todo o processo operacional, desde o atendimento até a administração.

### Problema que Resolve
- ❌ Pedidos em papel (perdem-se, ilegíveis, desorganizados)
- ❌ Falta de controle sobre o que cada mesa pediu
- ❌ Comunicação confusa entre atendimento e cozinha
- ❌ Dificuldade em acompanhar status dos pedidos
- ❌ Ausência de relatórios e análise de dados
- ❌ Controle de estoque manual e impreciso
- ❌ Gestão de usuários e permissões

### Solução Proposta
✅ **PWA para Atendentes** - Tablet/smartphone para anotar pedidos digitalmente  
✅ **Painel Cozinha** - Visualização em tempo real estilo Kanban (Preparando → Pronto)  
✅ **Tela Caixa** - Finalização de pedidos e controle de mesas  
✅ **Painel Admin** - Gestão completa de produtos, mesas, usuários e configurações  
✅ **Dashboard KPIs** - Análise de vendas, produtos mais vendidos, horários de pico  
✅ **Controle de Estoque** - Movimentações, alertas de estoque baixo e histórico  
✅ **Sistema de Autenticação** - Controle de acesso com grupos e permissões  
✅ **Impressão Térmica** - Automação de impressão na cozinha (em desenvolvimento)  
✅ **WebSocket** - Atualização em tempo real em todas as telas  

**IMPORTANTE:** Este sistema NÃO inclui integração de pagamento. O foco é na gestão operacional completa.

---

## 🏗️ Arquitetura do Sistema

### Visão de Alto Nível

```
┌──────────────────────────────────────────────────────────────────┐
│                       REDE LOCAL (LAN)                            │
│                                                                    │
│  ┌──────────────┐           ┌──────────────────┐                 │
│  │   Tablet/    │           │  Servidor Local  │                 │
│  │  Smartphone  │──────────▶│   (Node.js)      │                 │
│  │  (Atendente) │  Wi-Fi    │                  │                 │
│  │     PWA      │           │  Express + SQLite│                 │
│  └──────────────┘           │   Socket.io      │                 │
│                              │   Prisma ORM     │                 │
│                              └────────┬─────────┘                 │
│                                       │                           │
│                 ┌─────────────────────┼─────────────────┐        │
│                 │                     │                 │         │
│           ┌─────▼─────┐         ┌────▼────┐      ┌────▼────┐   │
│           │  Painel   │         │  Caixa  │      │  Admin  │    │
│           │  Cozinha  │         │  (Web)  │      │  (Web)  │    │
│           │   (Web)   │         └─────────┘      └─────────┘    │
│           └───────────┘                                          │
│                                                                   │
│           ┌──────────────┐         ┌───────────────┐            │
│           │  Dashboard   │         │  Impressora   │            │
│           │    (Web)     │         │   Térmica*    │            │
│           └──────────────┘         └───────────────┘            │
│                                     *Em desenvolvimento          │
└──────────────────────────────────────────────────────────────────┘
```

### Componentes Principais

#### 1. **Servidor Backend (Node.js + Express)**
- **Responsabilidades:**
  - API REST completa para todas as operações
  - Gerenciar pedidos, produtos, mesas, usuários (CRUD)
  - Armazenar dados no SQLite via Prisma ORM
  - Distribuir eventos em tempo real via WebSocket (Socket.io)
  - Controle de autenticação e autorização (JWT)
  - Cálculo de KPIs e estatísticas
  - Gestão de estoque e movimentações
  - Servir aplicação frontend

#### 2. **Frontend Hub** (React + Vite)
- **Responsabilidades:**
  - Tela inicial de login
  - Seleção de função (Atendente, Cozinha, Caixa, Admin, Dashboard)
  - Controle de permissões por usuário
  - Interface moderna e responsiva

#### 3. **Frontend PWA - Atendente** (React)
- **Responsabilidades:**
  - Interface otimizada para tablets/smartphones
  - Anotação de pedidos por mesa
  - Seleção de produtos por categoria
  - Busca rápida de produtos
  - Cadastro rápido de clientes
  - Carrinho de compras interativo
  - Campo de observações por item/pedido

#### 4. **Frontend Web - Painel Cozinha** (React)
- **Responsabilidades:**
  - Exibir pedidos em colunas estilo Kanban
  - 2 estados: "Preparando" → "Pronto"
  - Marcar pedidos como prontos
  - Notificações sonoras para novos pedidos
  - Atualização em tempo real via WebSocket
  - Interface otimizada para monitores grandes

#### 5. **Frontend Web - Caixa** (React)
- **Responsabilidades:**
  - Visualizar todas as mesas ocupadas
  - Detalhamento de consumo por mesa
  - Histórico completo de pedidos
  - Cálculo de totais
  - Finalizar pedidos (marcar como pago)
  - Liberação automática de mesas

#### 6. **Frontend Web - Admin** (React)
- **Responsabilidades:**
  - CRUD completo de Produtos e Categorias
  - CRUD de Mesas
  - CRUD de Usuários e Grupos
  - Gerenciamento de Permissões
  - Configurações do sistema
  - Interface com tabs organizadas

#### 7. **Frontend Web - Dashboard** (React)
- **Responsabilidades:**
  - KPIs principais (faturamento, ticket médio, etc)
  - Gráficos de vendas por período
  - Produtos mais vendidos
  - Horários de pico
  - Top clientes
  - Comparativos de períodos
  - Filtros de data customizáveis

#### 8. **Frontend Web - Estoque** (React)
- **Responsabilidades:**
  - Visualização de níveis de estoque
  - Registro de entradas e saídas
  - Ajustes manuais de estoque
  - Histórico de movimentações
  - Alertas de estoque baixo
  - Relatórios de movimentação

#### 9. **Banco de Dados (SQLite + Prisma)**
- **Responsabilidades:**
  - Armazenar todos os dados do sistema
  - 12 tabelas principais
  - Relacionamentos complexos
  - Persistência local
  - Facilidade de backup (único arquivo .db)
  - Migrações versionadas

---

## 🛠️ Stack Tecnológica

### Backend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 4.x | Framework web minimalista |
| **Prisma** | 5.x | ORM (Object-Relational Mapping) |
| **SQLite** | 3.x | Banco de dados local |
| **Socket.io** | 4.x | Comunicação em tempo real (WebSocket) |
| **bcryptjs** | 2.x | Hash de senhas |
| **jsonwebtoken** | 9.x | Autenticação JWT |
| **express-validator** | 7.x | Validação de inputs |
| **winston** | 3.x | Sistema de logs |
| **date-fns** | 3.x | Manipulação de datas |
| **node-thermal-printer** | 4.x | Controle de impressora térmica* |

*Em desenvolvimento

### Frontend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 18.x | Biblioteca para UI |
| **Vite** | 5.x | Build tool (rápido e moderno) |
| **TanStack Query** | 5.x | Gerenciamento de estado/cache |
| **React Router** | 6.x | Roteamento SPA |
| **Socket.io Client** | 4.x | Cliente WebSocket |
| **Tailwind CSS** | 3.x | Framework CSS utilitário |
| **Axios** | 1.x | Cliente HTTP |
| **Recharts** | 2.x | Biblioteca de gráficos |
| **date-fns** | 3.x | Formatação de datas |

### Ferramentas de Desenvolvimento
- **ESLint** - Linting
- **Prettier** - Formatação de código
- **Git** - Controle de versão

---

## 📊 Modelo de Dados Completo

### Diagrama ER Simplificado

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Usuario   │──────▶│ GrupoUsuario │◀──────│  Permissao  │
└─────────────┘       └──────────────┘       └─────────────┘
       │                                             
       │ (cria)                                      
       ▼                                             
┌─────────────┐       ┌──────────────┐              
│   Pedido    │──────▶│     Mesa     │              
└─────────────┘       └──────────────┘              
       │                                             
       │                                             
       ▼                                             
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│ ItemPedido  │──────▶│   Produto    │──────▶│  Categoria  │
└─────────────┘       └──────────────┘       └─────────────┘
       │                     │                       
       │                     │                       
       │                     ▼                       
       │              ┌──────────────┐              
       │              │ItemEstoque   │              
       │              └──────────────┘              
       │                                             
       ▼                                             
┌─────────────┐                                     
│   Cliente   │                                     
└─────────────┘                                     
```

### Tabelas Principais (12 no total)

1. **Usuario** - Usuários do sistema
2. **GrupoUsuario** - Grupos (Admin, Atendente, Cozinha, Caixa)
3. **Permissao** - Permissões granulares
4. **PermissaoGrupo** - Relação N:N entre grupos e permissões
5. **Cliente** - Clientes do estabelecimento
6. **Mesa** - Mesas do estabelecimento
7. **Pedido** - Pedidos realizados
8. **ItemPedido** - Itens de cada pedido
9. **Produto** - Produtos do cardápio
10. **Categoria** - Categorias de produtos
11. **ItemEstoque** - Controle de estoque por produto
12. **Configuracao** - Configurações gerais do sistema
13. **LogAcao** - Auditoria de ações dos usuários

---

## 🔄 Fluxo de Dados em Tempo Real

### 1. Atendente Cria Pedido
```
Tablet PWA (Atendente)
  → POST /api/pedidos { mesaId, clienteId?, itens[], observacao }
    → Backend valida dados (express-validator)
      → Cria pedido no SQLite (Prisma)
        → Atualiza estoque (se configurado)
          → Emite evento WebSocket: "novo_pedido"
            → Painel Cozinha recebe e exibe em "Preparando"
            → Caixa atualiza lista de mesas ocupadas
            → [Futuro] Impressora imprime pedido
              → Retorna sucesso para atendente
```

### 2. Cozinha Marca como Pronto
```
Painel Cozinha
  → PATCH /api/pedidos/:id/status { status: "pronto" }
    → Backend valida permissão
      → Atualiza status no banco
        → Emite evento WebSocket: "pedido_atualizado"
          → Painel Cozinha move card para coluna "Pronto"
          → Caixa atualiza status do pedido
          → [Opcional] Toca som de notificação
```

### 3. Caixa Finaliza Pedido
```
Tela Caixa
  → PATCH /api/pedidos/:id/status { status: "pago" }
    → Backend valida permissão
      → Marca pedido como pago
        → Verifica se todos pedidos da mesa foram pagos
          → Se sim, libera mesa (status = "livre")
            → Emite evento WebSocket: "pedido_finalizado"
              → Remove do painel cozinha
              → Atualiza lista de mesas no caixa
              → Atualiza estatísticas do cliente
```

### 4. Admin Atualiza Produto
```
Painel Admin
  → PUT /api/produtos/:id { nome, preco, disponivel, ... }
    → Backend valida permissão (somente Admin/Gerente)
      → Atualiza produto no banco
        → Emite evento WebSocket: "produto_atualizado"
          → Atendentes veem atualização em tempo real
          → Cache invalidado automaticamente (TanStack Query)
```

---

## 📱 Funcionalidades Detalhadas

### 🔐 Autenticação e Permissões
- **Login seguro** com JWT
- **4 grupos padrão**: Admin, Gerente, Atendente, Cozinha, Caixa
- **Permissões granulares**: 30+ permissões individuais
- **Controle de acesso** por tela e função
- **Sessões persistentes** com refresh token
- **Logs de auditoria** para ações críticas

### 📋 Gestão de Pedidos
- **Criação rápida** de pedidos por mesa
- **Busca/cadastro de clientes** por telefone
- **Observações** por item e por pedido
- **4 status**: Preparando → Pronto → Entregue → Pago
- **Cancelamento** com motivo registrado
- **Histórico completo** por mesa/cliente/período
- **Atualização em tempo real** via WebSocket

### 👨‍🍳 Painel Cozinha
- **Interface Kanban** (2 colunas: Preparando | Pronto)
- **Cards detalhados** com itens, quantidade, observações
- **Notificações sonoras** para novos pedidos
- **Indicador de tempo** desde criação
- **Filtros** por status
- **Auto-refresh** a cada 10 segundos
- **Design otimizado** para monitores grandes

### 💰 Gestão de Caixa
- **Visualização de mesas** ocupadas/livres
- **Detalhamento da conta** por mesa
- **Histórico de pedidos** da mesa
- **Cálculo automático** de totais
- **Finalização de pedidos** (marcar como pago)
- **Liberação automática** de mesas
- **Busca rápida** por número de mesa

### ⚙️ Painel Administrativo
- **CRUD Produtos**: Nome, descrição, preço, categoria, imagem, disponibilidade
- **CRUD Categorias**: Organização do cardápio
- **CRUD Mesas**: Número, capacidade, localização
- **CRUD Usuários**: Nome, email, grupo, permissões
- **Gestão de Grupos**: Atribuição de permissões
- **Sistema de tabs** organizado
- **Validações em tempo real**
- **Confirmações** para exclusões

### 📊 Dashboard e KPIs
- **Faturamento**: Hoje, semana, mês com comparativos
- **Ticket médio**: Valor médio por pedido
- **Total de pedidos**: Quantidade por período
- **Produtos mais vendidos**: Top 10 com gráficos
- **Horários de pico**: Análise de fluxo
- **Top clientes**: Maiores consumidores
- **Gráficos interativos**: Recharts
- **Filtros de período**: Hoje, ontem, semana, mês, customizado
- **Comparativos**: Período atual vs anterior

### 📦 Controle de Estoque
- **Visualização de níveis** de estoque
- **Registro de entradas**: Compras com fornecedor e nota
- **Registro de saídas**: Consumo interno, perdas
- **Ajustes manuais**: Com motivo registrado
- **Histórico completo** de movimentações
- **Alertas de estoque baixo**: Configurável por produto
- **Baixa automática**: Ao criar pedido (opcional)
- **Relatórios de movimentação**: Por período

### 🖨️ Impressão Térmica*
*Funcionalidade em desenvolvimento
- Impressão automática ao criar pedido
- Suporte a impressoras ESC/POS
- Conexão USB ou rede
- Formato customizável
- Impressão de comprovantes
---

## 📁 Estrutura Completa do Projeto

```
sistema-lanchonetes/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Conexão Prisma
│   │   │   └── socket.js            # Configuração Socket.io
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js              # Autenticação JWT
│   │   │   ├── authorize.js         # Verificação de permissões
│   │   │   ├── errorHandler.js      # Tratamento de erros global
│   │   │   └── validateRequest.js   # Validação de inputs
│   │   │
│   │   ├── routes/
│   │   │   ├── index.js             # Agregador de rotas
│   │   │   ├── auth.routes.js       # Login/logout/refresh
│   │   │   ├── pedidos.routes.js    # CRUD pedidos
│   │   │   ├── mesas.routes.js      # CRUD mesas
│   │   │   ├── produtos.routes.js   # CRUD produtos/categorias
│   │   │   ├── clientes.routes.js   # CRUD clientes
│   │   │   ├── usuarios.routes.js   # CRUD usuários/grupos
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
│   │   │   ├── socketService.js     # Lógica WebSocket
│   │   │   ├── printerService.js    # Impressora térmica*
│   │   │   ├── backupService.js     # Backup automático*
│   │   │   └── kpiService.js        # Cálculos de KPIs
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js            # Winston logs
│   │   │   ├── validators.js        # Validações customizadas
│   │   │   └── dateHelpers.js       # Helpers de data
│   │   │
│   │   └── server.js                # Entry point do backend
│   │
│   ├── prisma/
│   │   ├── schema.prisma            # Schema do banco (13 models)
│   │   ├── seed.js                  # Dados iniciais
│   │   └── migrations/              # Histórico de migrações
│   │
│   ├── logs/                        # Logs do sistema
│   ├── .env                         # Variáveis de ambiente
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
│   │       ├── novo-pedido.mp3      # Som novo pedido
│   │       └── pedido-pronto.mp3    # Som pedido pronto
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
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   │
│   │   │   ├── atendente/           # Componentes tela atendente
│   │   │   ├── cozinha/             # Componentes painel cozinha
│   │   │   ├── caixa/               # Componentes tela caixa
│   │   │   ├── admin/               # Componentes painel admin
│   │   │   ├── dashboard/           # Componentes dashboard
│   │   │   └── estoque/             # Componentes estoque
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Página de login
│   │   │   ├── Hub.jsx              # Seleção de função
│   │   │   ├── Atendente.jsx        # PWA para atendentes
│   │   │   ├── Cozinha.jsx          # Painel da cozinha
│   │   │   ├── Caixa.jsx            # Tela do caixa
│   │   │   ├── Admin.jsx            # Painel administrativo
│   │   │   ├── Dashboard.jsx        # Dashboard de KPIs
│   │   │   └── Estoque.jsx          # Controle de estoque
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js           # Hook de autenticação
│   │   │   ├── usePermissions.js    # Verificação de permissões
│   │   │   ├── usePedidos.js        # Operações de pedidos
│   │   │   ├── useMesas.js          # Operações de mesas
│   │   │   ├── useProdutos.js       # Operações de produtos
│   │   │   ├── useClientes.js       # Operações de clientes
│   │   │   ├── useSocket.js         # WebSocket
│   │   │   ├── useAdmin.js          # Operações admin
│   │   │   ├── useEstoque.js        # Operações estoque
│   │   │   └── useNotification.js   # Notificações sonoras
│   │   │
│   │   ├── services/
│   │   │   ├── api.js               # Axios configurado
│   │   │   ├── socket.js            # Socket.io client
│   │   │   ├── auth.service.js      # Serviços de auth
│   │   │   ├── pedidos.service.js   # Serviços de pedidos
│   │   │   ├── produtos.service.js  # Serviços de produtos
│   │   │   ├── mesas.service.js     # Serviços de mesas
│   │   │   ├── clientes.service.js  # Serviços de clientes
│   │   │   └── dashboard.service.js # Serviços de KPIs
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Context de autenticação
│   │   │   └── SocketContext.jsx    # Context WebSocket
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.js        # Formatação moeda, data
│   │   │   ├── constants.js         # Constantes
│   │   │   ├── storage.js           # localStorage helpers
│   │   │   └── sounds.js            # Helpers de áudio
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css          # Estilos globais + Tailwind
│   │   │   └── animations.css       # Animações customizadas
│   │   │
│   │   ├── App.jsx                  # Componente raiz
│   │   └── main.jsx                 # Entry point React
│   │
│   ├── index.html
│   ├── vite.config.js               # Config Vite + PWA
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env                         # Variáveis frontend
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── CRIACAO DO PROJETO/              # Documentação completa
│   ├── PHASE_00_PROJECT_SETUP.md
│   ├── PHASE_01_DATABASE_SCHEMA.md
│   ├── PHASE_02_BACKEND_CORE.md
│   ├── PHASE_03_AUTH_PERMISSIONS.md
│   ├── PHASE_04_FRONTEND_HUB.md
│   ├── PHASE_05_SCREEN_ATENDENTE.md
│   ├── PHASE_06_SCREEN_COZINHA.md
│   ├── PHASE_07_SCREEN_CAIXA.md
│   ├── PHASE_08_SCREEN_ADMIN.md
│   ├── PHASE_09_DASHBOARD_KPIS.md
│   ├── PHASE_10_ESTOQUE.md
│   ├── PHASE_11_PRINTER_BACKUP.md   # Em desenvolvimento
│   └── PHASE_12_POLISH_DEPLOY.md
│
├── .gitignore                       # Gitignore global
└── README.md                        # Este arquivo
```

*Funcionalidades em desenvolvimento

---

## 🚀 Setup e Instalação

### Pré-requisitos
- **Node.js** 18+ instalado ([Download](https://nodejs.org/))
- **npm** ou **yarn**
- **Git** (opcional)
- **Windows, Linux ou macOS**

### Instalação Completa

#### 1. Clone o Repositório
```bash
git clone <repo-url>
cd sistema-lanchonetes
```

#### 2. Backend Setup
```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env conforme necessário

# Criar banco de dados e rodar migrações
npx prisma migrate dev --name init

# Popular banco com dados iniciais (admin padrão + exemplos)
npx prisma db seed

# Iniciar servidor de desenvolvimento
npm run dev
```

**Servidor rodando em:** `http://localhost:3000`

**Credenciais padrão:**
- Email: `admin@sistema.com`
- Senha: `admin123`

#### 3. Frontend Setup
```bash
cd ../frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env conforme necessário

# Iniciar aplicação
npm run dev
```

**Aplicação rodando em:** `http://localhost:5173`

### Acessar o Sistema

1. Abra o navegador em `http://localhost:5173`
2. Faça login com as credenciais padrão
3. Selecione a função desejada no Hub

**Telas disponíveis:**
- 🛎️ **Atendente** - PWA otimizado para tablets
- 👨‍🍳 **Cozinha** - Painel Kanban em tempo real
- 💰 **Caixa** - Finalização de pedidos
- ⚙️ **Admin** - Gestão completa do sistema
- 📊 **Dashboard** - Análise de dados e KPIs
- 📦 **Estoque** - Controle de estoque

---

## 🔐 Sistema de Permissões

### Grupos Padrão

| Grupo | Descrição | Acesso |
|-------|-----------|--------|
| **Admin** | Administrador total | Todas as funcionalidades |
| **Gerente** | Gerente do estabelecimento | Dashboard, Admin (sem usuários), Estoque |
| **Atendente** | Garçom/Atendente | Criar pedidos, visualizar mesas |
| **Cozinha** | Equipe da cozinha | Painel cozinha (visualizar e atualizar) |
| **Caixa** | Operador de caixa | Finalizar pedidos, visualizar totais |

### Permissões Granulares (30+)

**Pedidos:**
- `criar_pedido`, `visualizar_pedido`, `editar_pedido`, `cancelar_pedido`

**Produtos:**
- `criar_produto`, `editar_produto`, `deletar_produto`, `visualizar_produto`

**Mesas:**
- `criar_mesa`, `editar_mesa`, `deletar_mesa`, `visualizar_mesa`

**Usuários:**
- `criar_usuario`, `editar_usuario`, `deletar_usuario`, `visualizar_usuario`

**Dashboard:**
- `ver_dashboard`, `ver_relatorios`, `exportar_dados`

**Estoque:**
- `ver_estoque`, `entrada_estoque`, `saida_estoque`, `ajuste_estoque`

---

## 📊 Dashboard - KPIs Disponíveis

### Métricas Principais
- **Faturamento**: Total do período selecionado
- **Ticket Médio**: Valor médio por pedido
- **Total de Pedidos**: Quantidade no período
- **Taxa de Ocupação**: Mesas ocupadas vs total
- **Tempo Médio**: Preparação, atendimento, permanência

### Gráficos
- **Faturamento por Período**: Linha temporal
- **Produtos Mais Vendidos**: Gráfico de barras horizontal
- **Horários de Pico**: Heatmap de pedidos por hora
- **Vendas por Categoria**: Gráfico de pizza
- **Comparativo de Períodos**: Barras lado a lado

### Filtros
- Hoje
- Ontem
- Esta Semana
- Este Mês
- Personalizado (data início e fim)

### Top Listas
- **Top 10 Clientes**: Maiores consumidores
- **Top 10 Produtos**: Mais vendidos
- **Top 5 Categorias**: Mais populares

---

## 🎨 Guia de Uso Rápido

### Para Atendentes

1. **Fazer Login**
   - Abrir aplicação no tablet
   - Inserir email e senha
   - Selecionar "Atendente"

2. **Criar Pedido**
   - Selecionar mesa
   - Escolher categoria de produtos
   - Adicionar produtos ao carrinho
   - Inserir observações (opcional)
   - Cadastrar cliente (opcional)
   - Confirmar pedido

3. **Visualizar Pedidos**
   - Ver pedidos ativos por mesa
   - Acompanhar status em tempo real

### Para Cozinha

1. **Acessar Painel**
   - Login com usuário da cozinha
   - Selecionar "Cozinha"

2. **Visualizar Pedidos**
   - Coluna "Preparando": Novos pedidos
   - Ver detalhes: itens, quantidades, observações

3. **Marcar como Pronto**
   - Clicar em "Marcar como Pronto"
   - Pedido move para coluna "Pronto"
   - Notificação enviada para caixa

### Para Caixa

1. **Ver Mesas Ocupadas**
   - Login com usuário do caixa
   - Selecionar "Caixa"
   - Visualizar todas as mesas ocupadas

2. **Finalizar Conta**
   - Clicar na mesa desejada
   - Ver histórico completo de pedidos
   - Verificar total
   - Clicar em "Marcar como Pago"
   - Mesa automaticamente liberada

### Para Administradores

1. **Gerenciar Produtos**
   - Acessar "Admin" → "Produtos"
   - Adicionar, editar ou remover produtos
   - Configurar preço, categoria, disponibilidade

2. **Gerenciar Usuários**
   - Acessar "Admin" → "Usuários"
   - Criar novo usuário
   - Atribuir grupo e permissões
   - Ativar/desativar usuários

3. **Configurar Mesas**
   - Acessar "Admin" → "Mesas"
   - Adicionar novas mesas
   - Definir número, capacidade, localização

4. **Ver Dashboard**
   - Acessar "Dashboard"
   - Selecionar período
   - Analisar KPIs e gráficos

5. **Controlar Estoque**
   - Acessar "Estoque"
   - Registrar entradas (compras)
   - Registrar saídas (perdas, consumo interno)
   - Ver alertas de estoque baixo

---

## 📈 Roadmap de Funcionalidades

### ✅ Fase 0 - Setup do Projeto (Concluída)
- [x] Estrutura de diretórios completa
- [x] Configuração Backend (Node.js + Express + Prisma)
- [x] Configuração Frontend (React + Vite + Tailwind)
- [x] WebSocket configurado (Socket.io)
- [x] Variáveis de ambiente

### ✅ Fase 1 - Database Schema (Concluída)
- [x] Schema Prisma com 13 models
- [x] Relacionamentos completos
- [x] Migrations aplicadas
- [x] Seed com dados iniciais
- [x] Admin padrão criado

### ✅ Fase 2 - Backend Core (Concluída)
- [x] Sistema de autenticação JWT
- [x] 8 rotas principais (auth, pedidos, mesas, produtos, clientes, usuários, estoque, dashboard)
- [x] Controllers com lógica de negócio
- [x] Middlewares (auth, autorização, validação, erro)
- [x] WebSocket com eventos em tempo real
- [x] Logger configurado (Winston)

### ✅ Fase 3 - Auth & Permissions Frontend (Concluída)
- [x] AuthContext e ProtectedRoute
- [x] Hook useAuth
- [x] Serviço API com interceptors
- [x] Persistência de token
- [x] Auto-refresh de token
- [x] Verificação de permissões

### ✅ Fase 4 - Hub & Login (Concluída)
- [x] Página de Login profissional
- [x] Hub com seleção de funções
- [x] Animações suaves
- [x] Componentes reutilizáveis (Button, Input, Card)
- [x] Menu de perfil com dropdown
- [x] Responsividade completa

### ✅ Fase 5 - Tela Atendente (Concluída)
- [x] PWA otimizado para tablets
- [x] Listagem de produtos por categoria
- [x] Busca de produtos
- [x] Carrinho de compras
- [x] Seleção de mesa
- [x] Cadastro rápido de cliente
- [x] Integração com backend
- [x] WebSocket em tempo real

### ✅ Fase 6 - Painel Cozinha (Concluída)
- [x] Interface Kanban (Preparando | Pronto)
- [x] Cards de pedido detalhados
- [x] Botão "Marcar como Pronto"
- [x] Notificações sonoras
- [x] Atualização automática em tempo real
- [x] Indicador de tempo
- [x] Animações de entrada/saída

### ✅ Fase 7 - Tela Caixa (Concluída)
- [x] Listagem de mesas com pedidos ativos
- [x] Cards de mesa com status
- [x] Modal de detalhamento da conta
- [x] Histórico de pedidos por mesa
- [x] Cálculo de totais
- [x] Finalização de pedidos
- [x] Liberação automática de mesas
- [x] WebSocket para atualizações

### ✅ Fase 8 - Admin Panel (Concluída)
- [x] Sistema de tabs
- [x] CRUD completo de Produtos
- [x] CRUD completo de Categorias
- [x] CRUD completo de Mesas
- [x] CRUD completo de Usuários
- [x] Visualização de Grupos e Permissões
- [x] Formulários validados
- [x] Modals de criação/edição
- [x] Confirmações de exclusão

### ✅ Fase 9 - Dashboard KPIs (Concluída)
- [x] Cards de KPIs principais
- [x] Gráfico de faturamento
- [x] Gráfico de produtos mais vendidos
- [x] Gráfico de horários de pico
- [x] Top 10 clientes
- [x] Comparativo de períodos
- [x] Filtros de data
- [x] Design profissional com Recharts

### ✅ Fase 10 - Estoque (Concluída)
- [x] Visualização de níveis de estoque
- [x] Registro de entradas
- [x] Registro de saídas
- [x] Ajustes manuais
- [x] Histórico de movimentações
- [x] Alertas de estoque baixo
- [x] Filtros e busca
- [x] Gráfico de movimentações

### 🔄 Fase 11 - Impressora & Backup (Em Desenvolvimento)
- [ ] Integração com impressora térmica
- [ ] Impressão automática de pedidos
- [ ] Configuração de layout de impressão
- [ ] Backup automático para Google Drive
- [ ] Backup manual com download
- [ ] Restauração de backups
- [ ] Agendamento de backups

### 🔄 Fase 12 - Polish & Deploy (Em Desenvolvimento)
- [ ] Otimizações de performance
- [ ] Service Worker completo (PWA)
- [ ] Manifest.json otimizado
- [ ] Ícones e favicons
- [ ] Build de produção
- [ ] Documentação de deploy
- [ ] Scripts de automação
- [ ] Testes finais

### 🚀 Versão 2.0 (Futuro)
- [ ] Migração para PostgreSQL (multi-estabelecimento)
- [ ] Aplicativo mobile nativo
- [ ] Comandas digitais (QR Code)
- [ ] Sistema de delivery integrado
- [ ] Relatórios avançados (PDF/Excel)
- [ ] Integração com sistemas de pagamento
- [ ] Sistema de fidelidade
- [ ] Multi-idiomas
- [ ] Modo escuro
- [ ] Notificações push

---

## 🧪 Testes e Qualidade

### Backend
```bash
cd backend

# Verificar banco de dados
npx prisma studio

# Ver logs do servidor
npm run dev
```

### Frontend
```bash
cd frontend

# Build de produção
npm run build

# Preview do build
npm run preview
```

### Checklist de Qualidade
- [x] Validação de inputs no backend
- [x] Tratamento de erros global
- [x] Logs estruturados (Winston)
- [x] Autenticação segura (JWT + bcrypt)
- [x] Proteção contra SQL injection (Prisma)
- [x] CORS configurado corretamente
- [x] Variáveis de ambiente separadas
- [x] Loading states em todas as operações
- [x] Feedback visual de sucesso/erro
- [x] Responsividade em todos os breakpoints

---

## 🔧 Troubleshooting

### Problema: Backend não inicia
**Solução:**
```bash
# Verificar se porta 3000 está disponível
netstat -ano | findstr :3000

# Verificar variáveis de ambiente
cat backend/.env

# Verificar instalação de dependências
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Problema: Frontend não conecta com backend
**Solução:**
```bash
# Verificar variável de ambiente
cat frontend/.env

# Deve conter:
# VITE_API_URL=http://localhost:3000/api
# VITE_SOCKET_URL=http://localhost:3000

# Reiniciar frontend
npm run dev
```

### Problema: Erro de migração do banco
**Solução:**
```bash
cd backend

# Resetar banco (CUIDADO: apaga todos os dados)
npx prisma migrate reset

# Ou criar nova migração
npx prisma migrate dev --name fix_migration

# Popular novamente
npx prisma db seed
```

### Problema: WebSocket não funciona
**Solução:**
- Verificar se backend está rodando
- Verificar URL do socket no `.env` do frontend
- Verificar console do navegador para erros de conexão
- Testar em navegador diferente

### Problema: Erro de CORS
**Solução:**
- Verificar configuração de CORS no backend
- Adicionar origem do frontend em `ALLOWED_ORIGINS`
- Reiniciar servidor backend

---

## 📦 Deploy em Produção

### Opção 1: Servidor Local (PC/Notebook do Cliente)

#### Requisitos
- Windows 10+ / Linux / macOS
- Node.js 18+ instalado
- 4GB RAM mínimo
- 10GB espaço em disco

#### Instalação
```bash
# 1. Instalar Node.js
# Download: https://nodejs.org/

# 2. Instalar PM2 (gerenciador de processos)
npm install -g pm2

# 3. Clonar projeto
git clone <repo-url>
cd sistema-lanchonetes

# 4. Configurar backend
cd backend
npm install --production
cp .env.example .env
# Editar .env com configurações de produção

# 5. Configurar banco
npx prisma migrate deploy
npx prisma db seed

# 6. Iniciar backend com PM2
pm2 start src/server.js --name pedidos-backend
pm2 startup
pm2 save

# 7. Configurar frontend
cd ../frontend
npm install
npm run build

# 8. Servir frontend (com PM2)
pm2 serve dist 80 --name pedidos-frontend
pm2 save

# 9. Verificar status
pm2 status
```

#### Acessar
- Abrir navegador: `http://localhost` ou `http://IP-DA-MAQUINA`

### Opção 2: Docker (Recomendado)

#### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: pedidos-backend
    ports:
      - "3000:3000"
    volumes:
      - ./backend/prisma:/app/prisma
      - ./backend/logs:/app/logs
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/prisma/prod.db
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped

  frontend:
    build: ./frontend
    container_name: pedidos-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  prisma_data:
  logs_data:
```

#### Comandos Docker
```bash
# Build e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Backup do banco
docker cp pedidos-backend:/app/prisma/prod.db ./backup-$(date +%Y%m%d).db
```

### Opção 3: VPS/Cloud (Internet)

**Provedores recomendados:**
- DigitalOcean
- AWS (EC2)
- Google Cloud
- Heroku
- Railway

**Stack recomendado para produção:**
- PostgreSQL (ao invés de SQLite)
- Nginx (proxy reverso)
- SSL/TLS (Let's Encrypt)
- PM2 (gerenciamento de processos)

---

## 🛡️ Segurança em Produção

### Checklist de Segurança

#### Backend
- [x] Senhas hasheadas com bcrypt
- [x] JWT com secret forte
- [x] Validação de inputs (express-validator)
- [x] Proteção SQL injection (Prisma)
- [ ] Rate limiting (express-rate-limit)
- [ ] Helmet.js para headers de segurança
- [ ] HTTPS em produção
- [ ] Variáveis sensíveis em .env (nunca no código)

#### Frontend
- [x] Tokens armazenados com segurança
- [x] Validação de inputs
- [x] Sanitização de dados
- [ ] Content Security Policy (CSP)
- [ ] HTTPS obrigatório
- [ ] SameSite cookies

#### Geral
- [x] CORS configurado corretamente
- [x] Logs de auditoria
- [ ] Backup automático diário
- [ ] Monitoramento de erros
- [ ] Atualizações de segurança

### Gerar JWT Secret Forte
```bash
# Linux/Mac
openssl rand -base64 64

# Windows (PowerShell)
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

---

## 📚 Documentação Completa

### Documentação do Projeto
Toda a documentação detalhada está na pasta `CRIACAO DO PROJETO/`:

- **PHASE_00** - Setup completo do projeto
- **PHASE_01** - Schema do banco de dados
- **PHASE_02** - Backend Core (API REST)
- **PHASE_03** - Autenticação e Permissões
- **PHASE_04** - Hub e Login
- **PHASE_05** - Tela Atendente (PWA)
- **PHASE_06** - Painel Cozinha
- **PHASE_07** - Tela Caixa
- **PHASE_08** - Painel Admin
- **PHASE_09** - Dashboard e KPIs
- **PHASE_10** - Controle de Estoque
- **PHASE_11** - Impressora e Backup (em desenvolvimento)
- **PHASE_12** - Polish e Deploy (em desenvolvimento)

### API Documentation

#### Autenticação
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@sistema.com",
  "senha": "admin123"
}

Response:
{
  "token": "eyJhbGc...",
  "usuario": {
    "id": 1,
    "nome": "Admin",
    "email": "admin@sistema.com",
    "grupo": { "nome": "Admin" }
  }
}
```

#### Pedidos
```http
# Listar pedidos
GET /api/pedidos
Authorization: Bearer {token}

# Criar pedido
POST /api/pedidos
Authorization: Bearer {token}
Content-Type: application/json

{
  "mesaId": 1,
  "clienteId": 1,
  "observacao": "Sem cebola",
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2,
      "observacao": "Mal passado"
    }
  ]
}

# Atualizar status
PATCH /api/pedidos/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "pronto"
}
```

#### Produtos
```http
# Listar produtos
GET /api/produtos

# Criar produto (Admin)
POST /api/produtos
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "X-Burger",
  "descricao": "Hambúrguer artesanal",
  "preco": 25.90,
  "categoriaId": 1,
  "disponivel": true
}
```

### WebSocket Events

#### Cliente → Servidor
```javascript
// Entrar em room
socket.emit('join:atendente');
socket.emit('join:cozinha');
socket.emit('join:caixa');
```

#### Servidor → Cliente
```javascript
// Novo pedido criado
socket.on('novo_pedido', (pedido) => {
  console.log('Novo pedido:', pedido);
});

// Pedido atualizado
socket.on('pedido_atualizado', (pedido) => {
  console.log('Pedido atualizado:', pedido);
});

// Pedido finalizado
socket.on('pedido_finalizado', (pedidoId) => {
  console.log('Pedido finalizado:', pedidoId);
});

// Produto atualizado
socket.on('produto_atualizado', (produto) => {
  console.log('Produto atualizado:', produto);
});
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Este projeto está em desenvolvimento ativo.

### Como Contribuir

1. **Fork o projeto**
2. **Crie uma branch** para sua feature
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
3. **Commit suas mudanças**
   ```bash
   git commit -m 'feat: adiciona nova funcionalidade'
   ```
4. **Push para a branch**
   ```bash
   git push origin feature/nova-funcionalidade
   ```
5. **Abra um Pull Request**

### Padrões de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração de código
- `test:` Testes
- `chore:` Manutenção

---

## 📞 Suporte e Contato

### Reporte de Bugs
Encontrou um bug? Abra uma [issue](https://github.com/seu-usuario/sistema-lanchonetes/issues) com:
- Descrição do problema
- Passos para reproduzir
- Screenshots (se aplicável)
- Ambiente (SO, navegador, versão Node.js)

### Solicitação de Features
Tem uma ideia? Abra uma [issue](https://github.com/seu-usuario/sistema-lanchonetes/issues) com:
- Descrição da feature
- Caso de uso
- Benefícios esperados

### Dúvidas
- Abrir [Discussão](https://github.com/seu-usuario/sistema-lanchonetes/discussions)
- Email: suporte@seusite.com

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2024 [Seu Nome/Empresa]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[Texto completo da licença MIT]
```

---

## 🎯 Notas para Desenvolvimento com IAs

### Contexto para IAs (GitHub Copilot, ChatGPT, Claude, etc.)

Este README foi estruturado para que **qualquer IA generativa** possa entender rapidamente o projeto e gerar código consistente.

### Arquitetura
- **Backend**: Express.js com Prisma ORM, controllers separados por recurso
- **Frontend**: React funcional com hooks, TanStack Query para cache
- **Banco**: SQLite com Prisma, migrações versionadas
- **Tempo Real**: Socket.io para eventos entre cliente e servidor

### Padrões de Código

**Backend:**
- Async/await em todas as operações assíncronas
- Try/catch em todos os controllers
- Validação com express-validator
- Logs com Winston
- JWT para autenticação
- Prisma transactions para operações críticas

**Frontend:**
- Componentes funcionais com hooks
- TanStack Query para estado do servidor
- Context API para estado global (auth, socket)
- Tailwind CSS para estilização
- Axios para requests HTTP
- Socket.io-client para WebSocket

### Convenções de Nomenclatura
- **Arquivos**: camelCase para JS, PascalCase para componentes React
- **Rotas API**: REST padrão (`GET /api/pedidos`, `POST /api/pedidos/:id`)
- **Eventos Socket**: snake_case (`novo_pedido`, `pedido_atualizado`)
- **Banco de dados**: PascalCase para models, camelCase para campos
- **Variáveis**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

### Prioridades
1. **Simplicidade**: Código limpo e fácil de manter
2. **Performance**: Operações em tempo real instantâneas
3. **Confiabilidade**: Sistema não pode perder dados
4. **Usabilidade**: Interface intuitiva para não técnicos
5. **Segurança**: Proteção de dados e autenticação

### Quando Gerar Código
- Seguir estrutura de diretórios estabelecida
- Usar Prisma para todas as operações de banco
- Implementar try/catch em todas as rotas
- Validar inputs antes de processar
- Emitir eventos WebSocket após mutações
- Usar TanStack Query no frontend
- Invalidar queries após mutações

---

## 📊 Status do Projeto

**Versão Atual:** 1.0.0  
**Status:** ✅ **10 de 12 fases concluídas**  
**Em Desenvolvimento:** Impressora & Backup, Polish & Deploy  
**Última Atualização:** Dezembro 2024  

### Progresso por Módulo
- ✅ Setup e Infraestrutura - 100%
- ✅ Backend API - 100%
- ✅ Autenticação - 100%
- ✅ Frontend Base - 100%
- ✅ Tela Atendente - 100%
- ✅ Painel Cozinha - 100%
- ✅ Tela Caixa - 100%
- ✅ Painel Admin - 100%
- ✅ Dashboard KPIs - 100%
- ✅ Controle Estoque - 100%
- 🔄 Impressora Térmica - 30%
- 🔄 Deploy & Polish - 50%

---

**Desenvolvido com ❤️ para revolucionar a gestão de lanchonetes**

**README.MD Version:** 2.0  
**Autor:** [Seu Nome/Empresa]  
**GitHub:** [github.com/seu-usuario/sistema-lanchonetes](https://github.com/seu-usuario/sistema-lanchonetes)