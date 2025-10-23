# Script de prueba para Helmet Security Headers
# Ejecutar: .\test-helmet.ps1

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔐 Test de Helmet.js - Security Headers" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Hacer una petición al servidor
Write-Host "📡 Haciendo petición a http://localhost:3000/api/health..." -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -UseBasicParsing
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    
    # Headers de seguridad implementados por Helmet
    $securityHeaders = @{
        "X-DNS-Prefetch-Control" = "Controla DNS prefetching"
        "X-Frame-Options" = "Protección contra Clickjacking"
        "X-Content-Type-Options" = "Previene MIME sniffing"
        "X-Download-Options" = "Protección IE8+"
        "X-Permitted-Cross-Domain-Policies" = "Control de políticas cross-domain"
        "Referrer-Policy" = "Control de información del referrer"
        "Strict-Transport-Security" = "Fuerza HTTPS (HSTS)"
        "Content-Security-Policy" = "Previene XSS y otros ataques"
        "Cross-Origin-Embedder-Policy" = "Control de recursos embebidos"
        "Cross-Origin-Opener-Policy" = "Control de ventanas cross-origin"
        "Cross-Origin-Resource-Policy" = "Control de recursos cross-origin"
        "X-XSS-Protection" = "Protección XSS (legacy)"
    }
    
    Write-Host "🛡️  Headers de Seguridad Detectados:" -ForegroundColor Yellow
    Write-Host ""
    
    $headersFound = 0
    $headersMissing = 0
    
    foreach ($headerName in $securityHeaders.Keys) {
        $headerValue = $response.Headers[$headerName]
        
        if ($headerValue) {
            $headersFound++
            Write-Host "   ✅ $headerName" -ForegroundColor Green
            Write-Host "      └─ Valor: $headerValue" -ForegroundColor Cyan
            Write-Host "      └─ $($securityHeaders[$headerName])" -ForegroundColor Gray
            Write-Host ""
        } else {
            $headersMissing++
            Write-Host "   ⚠️  $headerName (No presente)" -ForegroundColor Yellow
            Write-Host ""
        }
    }
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 Resumen:" -ForegroundColor Yellow
    Write-Host "   ✅ Headers encontrados: $headersFound" -ForegroundColor Green
    Write-Host "   ⚠️  Headers no presentes: $headersMissing" -ForegroundColor $(if ($headersMissing -eq 0) { "Green" } else { "Yellow" })
    Write-Host ""
    
    # Verificar headers críticos
    $criticalHeaders = @("X-Frame-Options", "X-Content-Type-Options", "Content-Security-Policy")
    $criticalFound = 0
    
    foreach ($header in $criticalHeaders) {
        if ($response.Headers[$header]) {
            $criticalFound++
        }
    }
    
    Write-Host "🔒 Headers Críticos de Seguridad:" -ForegroundColor Yellow
    Write-Host "   • X-Frame-Options: $(if ($response.Headers['X-Frame-Options']) { '✅' } else { '❌' })" -ForegroundColor $(if ($response.Headers['X-Frame-Options']) { "Green" } else { "Red" })
    Write-Host "   • X-Content-Type-Options: $(if ($response.Headers['X-Content-Type-Options']) { '✅' } else { '❌' })" -ForegroundColor $(if ($response.Headers['X-Content-Type-Options']) { "Green" } else { "Red" })
    Write-Host "   • Content-Security-Policy: $(if ($response.Headers['Content-Security-Policy']) { '✅' } else { '❌' })" -ForegroundColor $(if ($response.Headers['Content-Security-Policy']) { "Green" } else { "Red" })
    Write-Host ""
    
    if ($criticalFound -eq 3) {
        Write-Host "✅ ¡Todos los headers críticos están presentes!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Faltan headers críticos de seguridad" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error al conectar con el servidor:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Asegúrate de que el servidor esté corriendo:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Test completado" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Más información sobre Helmet.js:" -ForegroundColor Gray
Write-Host "   https://helmetjs.github.io/" -ForegroundColor Blue
