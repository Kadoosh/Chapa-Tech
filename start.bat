@echo off
chcp 65001 >nul
title Sistema Lanchonete - PM2

cd /d "%~dp0"

:: Verificar se PM2 está instalado
where pm2 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ ERRO: PM2 nao esta instalado!
    echo.
    echo Para instalar, execute:
    echo   npm install -g pm2
    echo.
    pause
    exit /b 1
)

echo.
echo ====================================================
echo   🚀 Sistema Lanchonete - Iniciando Servidores
echo ====================================================
echo.

:: Criar pasta de logs se não existir
if not exist "logs" mkdir logs

:: Iniciar Backend
echo [1/2] Iniciando Backend (porta 3000)...
call pm2 start ecosystem.config.cjs --only lanchonete-backend
if %ERRORLEVEL% neq 0 (
    echo ❌ Erro ao iniciar backend!
    pause
    exit /b 1
)

:: Iniciar Frontend
echo [2/2] Iniciando Frontend (porta 5173)...
call pm2 start ecosystem.config.cjs --only lanchonete-frontend
if %ERRORLEVEL% neq 0 (
    echo ❌ Erro ao iniciar frontend!
    pause
    exit /b 1
)

echo.
echo ====================================================
echo   ✅ Servidores Iniciados!
echo ====================================================
echo.
echo   📡 Backend:  http://localhost:3000
echo   🌐 Frontend: http://localhost:5173
echo.
echo ====================================================
echo   📋 LOGS EM TEMPO REAL (Pressione Ctrl+C para sair)
echo ====================================================
echo.

:: Manter terminal aberto com logs (cmd /k força terminal a permanecer aberto)
cmd /k pm2 logs
