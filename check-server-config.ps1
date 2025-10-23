# Script helper para verificar configuración antes de tests

Write-Host "🔍 Verificando configuración del servidor..." -ForegroundColor Cyan
Write-Host ""

# Verificar .env
$envPath = ".\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match "NODE_ENV\s*=\s*development") {
        Write-Host "✅ NODE_ENV=development configurado" -ForegroundColor Green
    } elseif ($envContent -match "NODE_ENV\s*=\s*production") {
        Write-Host "⚠️  NODE_ENV=production detectado" -ForegroundColor Yellow
        Write-Host "   Para testing, cambia a 'development' en .env" -ForegroundColor Yellow
        Write-Host "   Esto aumenta rate limit de 5 a 100 intentos/15min" -ForegroundColor Yellow
    } else {
        Write-Host "ℹ️  NODE_ENV no definido (default: development)" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️  Archivo .env no encontrado" -ForegroundColor Yellow
}

Write-Host ""

# Test de conectividad
Write-Host "🌐 Probando conexión al servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/" -Method GET -ErrorAction Stop
    Write-Host "✅ Servidor respondiendo en http://localhost:3000" -ForegroundColor Green
    Write-Host "   Versión: $($response.version)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Servidor NO responde" -ForegroundColor Red
    Write-Host "   Solución: Ejecuta 'node backend/server.js' en otra terminal" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test de rate limiting
Write-Host "🛡️  Verificando configuración de rate limiting..." -ForegroundColor Cyan
Write-Host "   Haciendo 3 requests de prueba a /api/health..." -ForegroundColor Gray

$successCount = 0
for ($i = 1; $i -le 3; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET -ErrorAction Stop
        $successCount++
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 429) {
            Write-Host "   ⚠️  Rate limit activo desde request $i" -ForegroundColor Yellow
            break
        }
    }
    Start-Sleep -Milliseconds 100
}

if ($successCount -eq 3) {
    Write-Host "   ✅ Rate limiting OK (3/3 requests exitosos)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Rate limit muy estricto ($successCount/3 exitosos)" -ForegroundColor Yellow
    Write-Host "   Solución: Reinicia el servidor para resetear contadores" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📝 RECOMENDACIONES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Si el servidor muestra 'Auth: 5 intentos/15min':" -ForegroundColor White
Write-Host "   → Asegúrate de tener NODE_ENV=development en .env" -ForegroundColor Gray
Write-Host "   → Reinicia el servidor" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Si ves muchos errores 429:" -ForegroundColor White
Write-Host "   → Reinicia el servidor con Ctrl+C → node backend/server.js" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Para producción:" -ForegroundColor White
Write-Host "   → Cambia NODE_ENV=production en .env" -ForegroundColor Gray
Write-Host "   → Rate limit volverá a 5 intentos/15min" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Listo para ejecutar tests!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
