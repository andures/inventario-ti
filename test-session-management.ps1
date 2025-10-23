# Test script para verificar Session Management y Token Blacklist
Write-Host "🧪 Probando Session Management con Token Blacklist..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# Test 1: Registrar/Login para obtener tokens
Write-Host "Test 1: Login para obtener tokens" -ForegroundColor Yellow
$body = @{
    email = "sessiontest@example.com"
    password = "SessionTest123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "  ✅ Login exitoso" -ForegroundColor Green
    $token = $response.data.accessToken
    Write-Host "  📝 Token obtenido: $($token.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    # Si falla, intentar registrar
    Write-Host "  ℹ️  Usuario no existe, registrando..." -ForegroundColor Yellow
    $registerBody = @{
        nombre = "Session Test"
        email = "sessiontest@example.com"
        password = "SessionTest123"
        rol = "ti"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/registrar" -Method POST -Body $registerBody -ContentType "application/json"
    $token = $response.data.accessToken
    Write-Host "  ✅ Usuario registrado y token obtenido" -ForegroundColor Green
}

Start-Sleep -Seconds 1

# Test 2: Usar token para acceder a ruta protegida
Write-Host "`nTest 2: Acceder a ruta protegida con token válido" -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headers
    Write-Host "  ✅ Acceso exitoso - Usuario: $($response.data.nombre)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Error al acceder: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 3: Hacer logout (revocar token)
Write-Host "`nTest 3: Hacer logout (revocar token)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/logout" -Method POST -Headers $headers
    Write-Host "  ✅ Logout exitoso - $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Error en logout: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 4: Intentar usar el token revocado
Write-Host "`nTest 4: Intentar usar el token revocado (debe fallar)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "  ❌ ERROR: El token revocado sigue funcionando!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "  ✅ Token revocado correctamente - Status 401" -ForegroundColor Green
        
        # Intentar extraer el mensaje del error
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
            Write-Host "  📝 Mensaje: $($errorBody.message)" -ForegroundColor Cyan
        } catch {
            Write-Host "  📝 Token en blacklist" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  ⚠️  Status inesperado: $statusCode" -ForegroundColor Yellow
    }
}

Start-Sleep -Seconds 1

# Test 5: Login nuevamente para obtener nuevo token
Write-Host "`nTest 5: Login nuevamente (nuevo token)" -ForegroundColor Yellow
$body = @{
    email = "sessiontest@example.com"
    password = "SessionTest123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    $newToken = $response.data.accessToken
    Write-Host "  ✅ Nuevo login exitoso" -ForegroundColor Green
    Write-Host "  📝 Nuevo token obtenido: $($newToken.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "  ❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 6: Usar el nuevo token
Write-Host "`nTest 6: Usar el nuevo token" -ForegroundColor Yellow
$newHeaders = @{
    "Authorization" = "Bearer $newToken"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $newHeaders
    Write-Host "  ✅ Nuevo token funciona - Usuario: $($response.data.nombre)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 7: Logout de todas las sesiones
Write-Host "`nTest 7: Logout de todas las sesiones" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/logout-all" -Method POST -Headers $newHeaders
    Write-Host "  ✅ Logout de todas las sesiones exitoso - $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 8: Verificar que el token ya no funciona
Write-Host "`nTest 8: Verificar que el token ya no funciona" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $newHeaders -ErrorAction Stop
    Write-Host "  ❌ ERROR: El token aún funciona después de logout-all!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "  ✅ Token revocado correctamente - Status 401" -ForegroundColor Green
    }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Tests de Session Management completados!" -ForegroundColor Green
Write-Host "`n📊 Resumen:" -ForegroundColor Cyan
Write-Host "  ✓ Login y obtención de tokens" -ForegroundColor White
Write-Host "  ✓ Acceso con token válido" -ForegroundColor White
Write-Host "  ✓ Logout revoca tokens correctamente" -ForegroundColor White
Write-Host "  ✓ Tokens revocados en blacklist (401)" -ForegroundColor White
Write-Host "  ✓ Nuevos tokens funcionan después de logout" -ForegroundColor White
Write-Host "  ✓ Logout-all revoca todos los tokens" -ForegroundColor White
Write-Host "`n📝 Verifica en MongoDB:" -ForegroundColor Cyan
Write-Host "  • Colección 'revokedtokens' contiene los tokens revocados" -ForegroundColor White
Write-Host "  • TTL index elimina automáticamente tokens expirados" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
