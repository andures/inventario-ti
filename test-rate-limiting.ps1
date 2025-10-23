# Script de prueba para Rate Limiting
# Ejecutar: .\test-rate-limiting.ps1

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🧪 Test de Rate Limiting" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Test 1: Verificar headers de rate limiting
Write-Host "📊 Test 1: Headers de Rate Limiting" -ForegroundColor Green
Write-Host "Haciendo una petición al endpoint /api/health..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -UseBasicParsing
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    
    # Mostrar headers de rate limiting
    $rateLimitHeaders = $response.Headers.GetEnumerator() | Where-Object { $_.Key -like "*RateLimit*" }
    
    if ($rateLimitHeaders) {
        Write-Host "`n📈 Headers de Rate Limiting:" -ForegroundColor Yellow
        foreach ($header in $rateLimitHeaders) {
            Write-Host "   $($header.Key): $($header.Value)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⚠️  No se encontraron headers de rate limiting" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Test 2: Probar límite general (10 requests rápidas)
Write-Host "🔄 Test 2: Límite General (10 requests)" -ForegroundColor Green
Write-Host "Haciendo 10 peticiones rápidas..." -ForegroundColor Gray

$successCount = 0
$failCount = 0

for ($i=1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -UseBasicParsing -ErrorAction Stop
        $successCount++
        Write-Host "  $i. ✅ Status $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $failCount++
        if ($_.Exception.Response.StatusCode -eq 429) {
            Write-Host "  $i. ⛔ Status 429 - Rate Limit Excedido" -ForegroundColor Red
        } else {
            Write-Host "  $i. ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    Start-Sleep -Milliseconds 100
}

Write-Host "`n📊 Resultados:" -ForegroundColor Yellow
Write-Host "   ✅ Exitosas: $successCount" -ForegroundColor Green
Write-Host "   ❌ Bloqueadas: $failCount" -ForegroundColor Red

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Test 3: Probar límite de autenticación (6 intentos de login fallidos)
Write-Host "🔐 Test 3: Límite de Autenticación (6 intentos de login)" -ForegroundColor Green
Write-Host "Intentando login con credenciales incorrectas..." -ForegroundColor Gray

$authSuccessCount = 0
$authFailCount = 0

for ($i=1; $i -le 6; $i++) {
    try {
        $body = @{
            email = "test@example.com"
            password = "wrongpassword123"
        } | ConvertTo-Json

        $response = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -UseBasicParsing `
            -ErrorAction Stop
        
        # No debería llegar aquí con credenciales incorrectas
        $authSuccessCount++
        Write-Host "  $i. ⚠️  Status $($response.StatusCode) (inesperado)" -ForegroundColor Yellow
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 429) {
            $authFailCount++
            Write-Host "  $i. ⛔ Status 429 - Rate Limit de Auth Excedido!" -ForegroundColor Red
        } elseif ($statusCode -eq 401) {
            $authSuccessCount++
            Write-Host "  $i. 🔓 Status 401 - Credenciales incorrectas (normal)" -ForegroundColor Cyan
        } else {
            Write-Host "  $i. ❌ Status $statusCode - Error: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Milliseconds 200
}

Write-Host "`n📊 Resultados:" -ForegroundColor Yellow
Write-Host "   🔓 Intentos permitidos (401): $authSuccessCount" -ForegroundColor Cyan
Write-Host "   ⛔ Bloqueados por rate limit (429): $authFailCount" -ForegroundColor Red

if ($authFailCount -gt 0) {
    Write-Host "`n✅ ¡Rate limiting de autenticación funcionando correctamente!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  El límite de auth aún no se alcanzó (esperado: 5 intentos)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Tests completados" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Nota: Los límites se resetean después de 15 minutos" -ForegroundColor Gray
