# 🚀 Guia de Deploy - Sistema Lanchonete

## 📋 Requisitos

### Software Necessário
- **Node.js** 20.x ou superior
- **NPM** 10.x ou superior
- **PM2** (gerenciador de processos)
- **Git** (para clonar o repositório)

### Hardware Recomendado (Servidor Local)
- CPU: 2+ cores
- RAM: 4GB+
- Armazenamento: 20GB+ SSD
- Rede: Conectividade estável na LAN

---

## 🔧 Instalação

### 1. Clonar Repositório
```bash
git clone https://github.com/seu-usuario/Sistema-Lanchonetes.git
cd Sistema-Lanchonetes
```

### 2. Instalar Dependências

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3. Configurar Variáveis de Ambiente

**Backend - Copiar e editar `.env`:**
```bash
cd backend
cp .env.example .env
# Editar .env com suas configurações
```

**IMPORTANTE:** Gerar um JWT_SECRET seguro:
```bash
# Windows PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# Linux/Mac
openssl rand -base64 64
```

**Frontend - Copiar e editar `.env`:**
```bash
cd frontend
cp .env.example .env.local
# Editar com URL da API
```

### 4. Configurar Banco de Dados
```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

### 5. Popular Dados Iniciais (Seed)
```bash
npx prisma db seed
```

---

## 🖥️ Executando com PM2

### Instalar PM2 Globalmente
```bash
npm install -g pm2
```

### Iniciar Serviços
```bash
# Na raiz do projeto
pm2 start ecosystem.config.cjs

# Verificar status
pm2 status

# Ver logs
pm2 logs
```

### Comandos Úteis PM2
```bash
# Reiniciar todos
pm2 restart all

# Parar todos
pm2 stop all

# Remover todos
pm2 delete all

# Monitoramento
pm2 monit

# Salvar configuração para reinício automático
pm2 save
pm2 startup
```

---

## 🌐 Configuração de Rede

### Descobrir IP do Servidor
```powershell
# Windows
ipconfig
# Procure por IPv4 Address (ex: 192.168.1.100)
```

### Liberar Firewall (Windows)
```powershell
# Como Administrador
netsh advfirewall firewall add rule name="Node Backend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Vite Frontend" dir=in action=allow protocol=TCP localport=5173
```

### Acessar de Outros Dispositivos
- **Frontend:** `http://192.168.1.100:5173`
- **API:** `http://192.168.1.100:3000/api`

---

## 📱 Configurando Dispositivos

### Tablets/Smartphones
1. Conectar na mesma rede Wi-Fi
2. Abrir navegador (Chrome recomendado)
3. Acessar: `http://IP-DO-SERVIDOR:5173`
4. (Opcional) Adicionar à tela inicial como PWA

### Monitor da Cozinha
1. Conectar PC/TV ao servidor via rede
2. Abrir Chrome em modo kiosk:
```bash
chrome.exe --kiosk --app=http://192.168.1.100:5173/cozinha
```

---

## 🔒 Segurança

### Produção
1. **SEMPRE** alterar o `JWT_SECRET`
2. Usar HTTPS em ambiente exposto à internet
3. Configurar `ALLOWED_ORIGINS` corretamente
4. Manter Node.js atualizado
5. Fazer backups regulares

### Usuário Admin Padrão
- **Login:** admin
- **Senha:** admin123

**⚠️ ALTERE A SENHA APÓS O PRIMEIRO LOGIN!**

---

## 🗄️ Backup

### Backup Manual
```bash
# Via API
curl -X POST http://localhost:3000/api/backup/criar

# Arquivos ficam em: backend/backups/
```

### Backup Automático
Configure pelo painel de Configurações > Backup ou edite `backend/data/backup-config.json`.

### Restaurar Backup
```bash
# Parar serviços
pm2 stop all

# Extrair backup
cd backend
unzip backups/backup-XXXXXXXX.zip -d ./prisma

# Reiniciar
pm2 restart all
```

---

## 🐛 Troubleshooting

### Porta em uso
```powershell
# Descobrir processo
netstat -ano | findstr :3000

# Matar processo (PID do comando anterior)
taskkill /PID XXXX /F
```

### Erro de Prisma
```bash
cd backend
npx prisma generate
npx prisma migrate reset
```

### Limpar Cache NPM
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Logs de Erro
```bash
# PM2
pm2 logs --err

# Backend
cat backend/logs/combined.log
```

---

## 📊 Monitoramento

### Verificar Saúde
```bash
# API Health Check
curl http://localhost:3000/health

# Deve retornar: { "status": "ok" }
```

### Métricas PM2
```bash
pm2 monit
```

---

## 🔄 Atualizações

```bash
# Parar serviços
pm2 stop all

# Atualizar código
git pull origin main

# Atualizar dependências
cd backend && npm install
cd ../frontend && npm install

# Migrar banco (se necessário)
cd ../backend && npx prisma migrate deploy

# Reiniciar
pm2 restart all
```

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs (`pm2 logs`)
2. Consulte a documentação da API (`API_DOCS.md`)
3. Abra uma issue no GitHub

---

**Versão:** 1.0.0  
**Última atualização:** Dezembro 2024
