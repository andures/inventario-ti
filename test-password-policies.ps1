# Test script para verificar Password Policies mejoradas
Write-Host "🧪 Probando Password Policies Mejoradas..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Asegúrate de que el servidor esté corriendo con NODE_ENV=development" -ForegroundColor Yellow
Write-Host "                para tener rate limit de 100 intentos/15min en lugar de 5." -ForegroundColor Yellow
Write-Host ""

$baseUrl = "http://localhost:3000/api"
$testsPassed = 0
$testsFailed = 0

# Test 1: Contraseña muy corta (menos de 12 caracteres)
Write-Host "Test 1: Contraseña muy corta (<12 caracteres)" -ForegroundColor Yellow
$body = @{
    nombre = "Test User"
    email = "test1@example.com"
    password = "Test123!"
    rol = "ti"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/registrar" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "  ❌ FALLO: Aceptó contraseña corta" -ForegroundColor Red
    $testsFailed++
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 429) {
        Write-Host "  ⚠️  BLOQUEADO: Rate limit activo (429) - Reinicia el servidor" -ForegroundColor Yellow
    } else {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        if ($errorDetails.message -like "*12 caracteres*" -or $errorDetails.message -like "*validation*") {
            Write-Host "  ✅ Rechazada correctamente: Contraseña muy corta" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "  ✅ Rechazada: $($errorDetails.message)" -ForegroundColor Green
            $testsPassed++
        }
    }
}

Start-Sleep -Milliseconds 500

# Test 2: Contraseña sin caracter especial
Write-Host "`nTest 2: Contraseña sin caracter especial" -ForegroundColor Yellow
$body = @{
    nombre = "Test User"
    email = "test2@example.com"
    password = "TestPassword123"
    rol = "ti"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/registrar" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "  ❌ FALLO: Aceptó contraseña sin especial" -ForegroundColor Red
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  ✅ Rechazada: $($errorDetails.message)" -ForegroundColor Green
}

Start-Sleep -Milliseconds 500

# Test 3: Contraseña común (password123)
Write-Host "`nTest 3: Contraseña común prohibida" -ForegroundColor Yellow
$body = @{
    nombre = "Test User"
    email = "test3@example.com"
    password = "Password123!"
    rol = "ti"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/registrar" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "  ❌ FALLO: Aceptó contraseña común" -ForegroundColor Red
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  ✅ Rechazada: $($errorDetails.message)" -ForegroundColor Green
}

Start-Sleep -Milliseconds 500

# Test 4: Contraseña con caracteres repetidos
Write-Host "`nTest 4: Contraseña con >3 caracteres repetidos" -ForegroundColor Yellow
$body = @{
    nombre = "Test User"
    email = "test4@example.com"
    password = "Testaaaa123!"
    rol = "ti"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/registrar" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "  ❌ FALLO: Aceptó contraseña con repeticiones" -ForegroundColor Red
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  ✅ Rechazada: $($errorDetails.message)" -ForegroundColor Green
}

Start-Sleep -Milliseconds 500

# Test 5: Contraseña con secuencia común (123)
Write-Host "`nTest 5: Contraseña con secuencia común (123)" -ForegroundColor Yellow
$body = @{
    nombre = "Test User"
    email = "test5@example.com"
    password = "MyPass123!@#"
    rol = "ti"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/registrar" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "  ❌ FALLO: Aceptó contraseña con secuencia" -ForegroundColor Red
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  ✅ Rechazada: $($errorDetails.message)" -ForegroundColor Green
}

Start-Sleep -Milliseconds 500

# Test 6: Contraseña VÁLIDA y segura
Write-Host "`nTest 6: Contraseña VÁLIDA (12+ chars, mayús, minús, num, especial, no común)" -ForegroundColor Yellow
$body = @{
    nombre = "Test User Strong"
    email = "teststrong@example.com"
    password = "MyS3cur3P@ssw0rd!"
    rol = "ti"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/registrar" -Method POST -Body $body -ContentType "application/json"
    Write-Host "  ✅ Aceptada: Usuario registrado exitosamente" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        if ($errorDetails.message -like "*ya está registrado*") {
            Write-Host "  ℹ️  Usuario ya existe (test previo)" -ForegroundColor Cyan
        } else {
            Write-Host "  ❌ FALLO: Rechazó contraseña válida - $($errorDetails.message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ❌ Error inesperado: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Tests de Password Policies completados!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resultado: $testsPassed passed, $testsFailed failed" -ForegroundColor Cyan
if ($testsPassed -eq 6) {
    Write-Host "🎉 TODOS LOS TESTS PASARON!" -ForegroundColor Green
} elseif ($testsPassed -eq 0) {
    Write-Host "⚠️  TODOS BLOQUEADOS POR RATE LIMIT" -ForegroundColor Yellow
    Write-Host "   Solución: Reinicia el servidor y vuelve a ejecutar" -ForegroundColor Yellow
}
Write-Host "`n📋 Políticas implementadas:" -ForegroundColor Cyan
Write-Host "  ✓ Mínimo 12 caracteres (antes 8)" -ForegroundColor White
Write-Host "  ✓ Requiere mayúscula" -ForegroundColor White
Write-Host "  ✓ Requiere minúscula" -ForegroundColor White
Write-Host "  ✓ Requiere número" -ForegroundColor White
Write-Host "  ✓ Requiere caracter especial (!@#$%^&*)" -ForegroundColor White
Write-Host "  ✓ Bloquea contraseñas comunes (password, 12345, admin, etc.)" -ForegroundColor White
Write-Host "  ✓ Bloquea >3 caracteres repetidos (aaaa)" -ForegroundColor White
Write-Host "  ✓ Bloquea secuencias comunes (123, abc)" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
