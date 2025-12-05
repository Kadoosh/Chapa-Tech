# Script para iniciar o Sistema Lanchonete
# Uso: .\start.ps1 [dev|prod|stop|status|logs]

param(
    [string]$Action = "dev"
)

$ProjectRoot = $PSScriptRoot

function Start-Dev {
    Write-Host "🚀 Iniciando servidores em modo desenvolvimento..." -ForegroundColor Green
    
    # Backend com PM2
    Set-Location "$ProjectRoot"
    pm2 start ecosystem.config.cjs --only lanchonete-backend
    
    # Frontend em novo terminal
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\frontend'; npm run dev -- --host"
    
    Write-Host ""
    Write-Host "✅ Servidores iniciados!" -ForegroundColor Green
    Write-Host "📡 Backend:  http://localhost:3000" -ForegroundColor Cyan
    Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Use 'pm2 logs lanchonete-backend' para ver logs do backend" -ForegroundColor Yellow
}

function Start-Prod {
    Write-Host "🚀 Iniciando servidores em modo produção..." -ForegroundColor Green
    Set-Location "$ProjectRoot"
    pm2 start ecosystem.config.cjs --env production
    pm2 save
    Write-Host "✅ Servidores iniciados em produção!" -ForegroundColor Green
}

function Stop-All {
    Write-Host "🛑 Parando todos os servidores..." -ForegroundColor Yellow
    pm2 stop all
    Write-Host "✅ Servidores parados!" -ForegroundColor Green
}

function Show-Status {
    Write-Host "📊 Status dos servidores:" -ForegroundColor Cyan
    pm2 status
}

function Show-Logs {
    Write-Host "📋 Logs dos servidores:" -ForegroundColor Cyan
    pm2 logs --lines 50
}

switch ($Action.ToLower()) {
    "dev" { Start-Dev }
    "prod" { Start-Prod }
    "stop" { Stop-All }
    "status" { Show-Status }
    "logs" { Show-Logs }
    default {
        Write-Host "❌ Ação inválida: $Action" -ForegroundColor Red
        Write-Host ""
        Write-Host "Uso: .\start.ps1 [dev|prod|stop|status|logs]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  dev    - Inicia em modo desenvolvimento (padrão)"
        Write-Host "  prod   - Inicia em modo produção"
        Write-Host "  stop   - Para todos os servidores"
        Write-Host "  status - Mostra status dos servidores"
        Write-Host "  logs   - Mostra logs dos servidores"
    }
}
