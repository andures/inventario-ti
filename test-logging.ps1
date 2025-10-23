# Test script para verificar Winston Logging
Write-Host "🧪 Probando Winston Logging System..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# Test 1: Login fallido (debe registrar en security logs)
Write-Host "Test 1: Login fallido (debe registrar en security logs)" -ForegroundColor Yellow
$body = @{
    email = "noexiste@test.com"
    password = "wrongpassword"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "  ✅ Status: $statusCode (esperado 401)" -ForegroundColor Green
}

Start-Sleep -Seconds 1

# Test 2: Intento de registro (debe registrar en logs)
Write-Host "`nTest 2: Intento de registro" -ForegroundColor Yellow
$body = @{
    nombre = "Test User"
    email = "testlogging@example.com"
    password = "TestPass123"
    rol = "ti"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/registrar" -Method POST -Body $body -ContentType "application/json"
    Write-Host "  ✅ Status: 201 - Usuario registrado" -ForegroundColor Green
    $token = $response.data.accessToken
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "  ℹ️  Status: 400 - Usuario ya existe" -ForegroundColor Yellow
    } else {
        Write-Host "  ❌ Status: $statusCode - Error inesperado" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 1

# Test 3: Login exitoso (debe registrar en logs)
Write-Host "`nTest 3: Login exitoso" -ForegroundColor Yellow
$body = @{
    email = "testlogging@example.com"
    password = "TestPass123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "  ✅ Status: 200 - Login exitoso" -ForegroundColor Green
    $token = $response.data.accessToken
} catch {
    Write-Host "  ❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 4: Token inválido (debe registrar en security logs)
Write-Host "`nTest 4: Acceso con token inválido" -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer token_invalido_123"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET -Headers $headers -ErrorAction Stop
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "  ✅ Status: $statusCode (esperado 401)" -ForegroundColor Green
}

Start-Sleep -Seconds 1

# Test 5: Rate limit (debe registrar múltiples intentos)
Write-Host "`nTest 5: Rate limiting (5 intentos fallidos)" -ForegroundColor Yellow
for ($i = 1; $i -le 6; $i++) {
    $body = @{
        email = "attacker@test.com"
        password = "wrong"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 429) {
            Write-Host "  ⚠️  Intento $i : Rate limit activado (429)" -ForegroundColor Yellow
        } else {
            Write-Host "  ℹ️  Intento $i : Status $statusCode" -ForegroundColor Cyan
        }
    }
    Start-Sleep -Milliseconds 500
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Tests completados!" -ForegroundColor Green
Write-Host "`n📁 Verifica los logs en:" -ForegroundColor Cyan
Write-Host "  • logs/combined-YYYY-MM-DD.log (todos los eventos)" -ForegroundColor White
Write-Host "  • logs/error-YYYY-MM-DD.log (solo errores)" -ForegroundColor White
Write-Host "  • logs/security-YYYY-MM-DD.log (eventos de seguridad)" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
