# 🚀 INÍCIO RÁPIDO - Guia de Desenvolvimento

## 📋 Antes de Começar

### ✅ Pré-requisitos Instalados?
- [ ] Node.js 18+ ([Download](https://nodejs.org/))
- [ ] npm 8+ (vem com Node.js)
- [ ] Git ([Download](https://git-scm.com/))
- [ ] VS Code ([Download](https://code.visualstudio.com/))

### Verificar Instalações
```powershell
node --version   # Deve mostrar v18.x.x ou superior
npm --version    # Deve mostrar 8.x.x ou superior
git --version    # Deve mostrar git version x.x.x
```

---

## 🎯 Passo a Passo - Fase 0 (Setup Inicial)

### 1. Estrutura de Pastas (1 minuto)

```powershell
# Você está em: C:\Users\Svcsuporte\Documents\GitHub\Sistema-Lanchonetes

# Criar pastas principais
mkdir backend
mkdir frontend
```

### 2. Backend Setup (5-10 minutos)

```powershell
# Entrar na pasta backend
cd backend

# Inicializar projeto Node.js
npm init -y

# Instalar dependências principais
npm install express cors dotenv
npm install @prisma/client
npm install socket.io
npm install bcryptjs jsonwebtoken
npm install express-validator
npm install winston
npm install date-fns

# Instalar dependências de desenvolvimento
npm install -D prisma nodemon

# Inicializar Prisma
npx prisma init --datasource-provider sqlite

# Criar estrutura de pastas
mkdir src
mkdir src\config
mkdir src\middleware
mkdir src\routes
mkdir src\controllers
mkdir src\services
mkdir src\utils
mkdir logs
```

### 3. Configurar package.json do Backend

Abrir `backend/package.json` e adicionar scripts:

```json
{
  "name": "sistema-lanchonetes-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "migrate": "npx prisma migrate dev",
    "seed": "npx prisma db seed",
    "studio": "npx prisma studio"
  },
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

### 4. Criar arquivo .env do Backend

Criar `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=seu-secret-super-secreto-mude-isso-depois
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:5173
```

### 5. Frontend Setup (5-10 minutos)

```powershell
# Voltar para raiz
cd ..

# Criar projeto Vite + React
npm create vite@latest frontend -- --template react

# Entrar na pasta frontend
cd frontend

# Instalar dependências base
npm install

# Instalar dependências adicionais
npm install react-router-dom
npm install @tanstack/react-query
npm install axios
npm install socket.io-client
npm install date-fns

# Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Instalar Recharts (para Dashboard)
npm install recharts
```

### 6. Configurar Tailwind CSS

Editar `frontend/tailwind.config.js`:

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
          50: '#fef5ee',
          100: '#fde8d7',
          200: '#fbcdae',
          300: '#f8ab7a',
          400: '#f47e44',
          500: '#f1621f',
          600: '#e24915',
          700: '#bb3613',
          800: '#952d17',
          900: '#792816',
        },
      },
    },
  },
  plugins: [],
}
```

### 7. Configurar arquivo .env do Frontend

Criar `frontend/.env`:

```env
# API
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# App
VITE_APP_NAME=Sistema de Lanchonetes
VITE_APP_VERSION=1.0.0
```

### 8. Atualizar package.json do Frontend

Verificar se tem os scripts no `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## ✅ Verificação Rápida

### Testar Backend
```powershell
cd backend
npm run dev
```

**Deve mostrar erro** (normal! ainda não criamos server.js)

### Testar Frontend
```powershell
cd frontend
npm run dev
```

**Deve abrir** em `http://localhost:5173` com a página padrão do Vite

---

## 📝 Próximos Passos

### Agora você está pronto para:

1. **Criar Schema do Prisma** (Fase 1)
   - Abrir `CRIACAO DO PROJETO/PHASE_01_DATABASE_SCHEMA.md`
   - Copiar schema completo
   - Colar em `backend/prisma/schema.prisma`
   - Rodar migrations

2. **Criar Backend** (Fase 2)
   - Abrir `CRIACAO DO PROJETO/PHASE_02_BACKEND_CORE.md`
   - Criar server.js
   - Criar middlewares
   - Criar rotas
   - Criar controllers

3. **Continuar com as demais fases...**

---

## 🎯 Estrutura Esperada Após Setup

```
Sistema-Lanchonetes/
├── backend/
│   ├── node_modules/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   ├── logs/
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── CRIACAO DO PROJETO/
│   └── (todas as fases)
│
├── README.MD
├── VALIDACAO_PROJETO.md
└── INICIO_RAPIDO.md (este arquivo)
```

---

## 💡 Dicas Importantes

### VS Code
- Instale extensões: Prisma, ESLint, Prettier, Tailwind CSS IntelliSense
- Use `Ctrl + J` para abrir terminal integrado
- Use `Ctrl + P` para busca rápida de arquivos

### Terminal
- Tenha 2 terminais abertos:
  - Terminal 1: `backend/` → `npm run dev`
  - Terminal 2: `frontend/` → `npm run dev`

### Git
```powershell
# Inicializar Git (se ainda não fez)
git init

# Criar .gitignore
# (copiar do PHASE_00_PROJECT_SETUP.md)

# Primeiro commit
git add .
git commit -m "feat: setup inicial do projeto"
```

---

## 🚨 Problemas Comuns

### "npm não é reconhecido"
**Solução:** Instalar Node.js e reiniciar terminal

### "Porta 3000 já está em uso"
**Solução:** 
```powershell
# Verificar o que está usando a porta
netstat -ano | findstr :3000

# Matar o processo (substitua PID pelo número)
taskkill /PID numero_do_pid /F

# Ou mudar porta no .env
PORT=3001
```

### "Cannot find module"
**Solução:**
```powershell
# Deletar node_modules e reinstalar
rm -r node_modules
npm install
```

---

## ⏱️ Tempo Estimado

- **Setup Inicial (Fase 0):** 20-30 minutos
- **Primeira vez com Node.js:** 40-60 minutos (incluindo aprendizado)

---

## 📚 Documentação de Referência

- **Node.js:** https://nodejs.org/docs
- **Express:** https://expressjs.com/
- **Prisma:** https://www.prisma.io/docs
- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Socket.io:** https://socket.io/docs

---

## 🎉 Pronto!

Após seguir este guia, você terá:
- ✅ Estrutura de pastas criada
- ✅ Dependências instaladas
- ✅ Configurações básicas prontas
- ✅ Ambiente de desenvolvimento funcionando

**Próximo passo:** Abrir `CRIACAO DO PROJETO/PHASE_01_DATABASE_SCHEMA.md`

---

**Boa sorte!** 🚀
