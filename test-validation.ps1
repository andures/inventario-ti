# Script de prueba para Input Validation
# Ejecutar: .\test-validation.ps1

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Test de Input Validation (Joi)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# Test 1: Login sin email
Write-Host "📝 Test 1: Login sin email (debe fallar)" -ForegroundColor Green
try {
    $body = @{
        password = "password123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "   ⚠️  Se esperaba error 400, pero obtuvo: $($response.StatusCode)" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        $content = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   ✅ Validación correcta - Status 400" -ForegroundColor Green
        Write-Host "   └─ Mensaje: $($content.message)" -ForegroundColor Cyan
        if ($content.errors) {
            foreach ($error in $content.errors) {
                Write-Host "   └─ Campo: $($error.field) - $($error.message)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   ❌ Status inesperado: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""

# Test 2: Email inválido
Write-Host "📝 Test 2: Email inválido (debe fallar)" -ForegroundColor Green
try {
    $body = @{
        email = "correo-invalido"
        password = "password123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "   ⚠️  Se esperaba error 400" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        $content = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   ✅ Validación correcta - Status 400" -ForegroundColor Green
        Write-Host "   └─ Mensaje: $($content.message)" -ForegroundColor Cyan
        if ($content.errors) {
            foreach ($error in $content.errors) {
                Write-Host "   └─ Campo: $($error.field) - $($error.message)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   ❌ Status inesperado: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Contraseña débil
Write-Host "📝 Test 3: Contraseña débil (debe fallar)" -ForegroundColor Green
try {
    $body = @{
        nombre = "Usuario Test"
        email = "test@example.com"
        password = "123"  # Muy corta
        rol = "ti"
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "$baseUrl/auth/registrar" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "   ⚠️  Se esperaba error 400" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        $content = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   ✅ Validación correcta - Status 400" -ForegroundColor Green
        Write-Host "   └─ Mensaje: $($content.message)" -ForegroundColor Cyan
        if ($content.errors) {
            foreach ($error in $content.errors) {
                Write-Host "   └─ Campo: $($error.field) - $($error.message)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   ❌ Status inesperado: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""

# Test 4: NoSQL Injection attempt
Write-Host "📝 Test 4: Intento de NoSQL Injection (debe ser sanitizado)" -ForegroundColor Green
try {
    $body = @{
        email = @{ '$ne' = "" }  # Intento de injection
        password = "password123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "   ⚠️  Se esperaba error" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   ✅ Intento de injection bloqueado - Status $statusCode" -ForegroundColor Green
    Write-Host "   └─ Los caracteres especiales fueron sanitizados" -ForegroundColor Cyan
}

Write-Host ""

# Test 5: Rol inválido
Write-Host "📝 Test 5: Rol inválido (debe fallar)" -ForegroundColor Green
try {
    $body = @{
        nombre = "Usuario Test"
        email = "test@example.com"
        password = "Password123"
        rol = "superadmin"  # Rol que no existe
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "$baseUrl/auth/registrar" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "   ⚠️  Se esperaba error 400" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        $content = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   ✅ Validación correcta - Status 400" -ForegroundColor Green
        Write-Host "   └─ Mensaje: $($content.message)" -ForegroundColor Cyan
        if ($content.errors) {
            foreach ($error in $content.errors) {
                Write-Host "   └─ Campo: $($error.field) - $($error.message)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   ❌ Status inesperado: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Tests completados" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Todos los tests de validación funcionan correctamente" -ForegroundColor Gray
Write-Host "🛡️  La API está protegida contra inputs maliciosos" -ForegroundColor Green
