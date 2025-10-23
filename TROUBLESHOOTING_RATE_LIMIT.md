# Guía para Testing con Rate Limiting

## Problema

Los tests múltiples activan el rate limiting (429 Too Many Requests) después de:

- 5 intentos en rutas de auth (/login, /registrar)
- 100 intentos en rutas generales

## Soluciones

### 1. Esperar el Reset (Recomendado para Producción)

- Rate limiting auth: 15 minutos
- Rate limiting general: 15 minutos
- El servidor muestra el tiempo restante en la respuesta 429

### 2. Reiniciar el Servidor (Rápido para Development)

```powershell
# Presiona Ctrl+C en la terminal donde corre el servidor
# Luego:
node backend/server.js
```

El contador de rate limiting está en memoria, se resetea con el servidor.

### 3. Aumentar Límite para Testing (Solo Development)

**Modificar temporalmente `backend/server.js`:**

```javascript
// ORIGINAL (Producción)
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // ← 5 intentos
  skipSuccessfulRequests: true,
});

// TESTING (Development)
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // ← Aumentado temporalmente
  skipSuccessfulRequests: true,
});
```

**⚠️ IMPORTANTE:** Restaurar el límite a 5 después de testing.

### 4. Deshabilitar Rate Limiting para Testing (No Recomendado)

**Modificar temporalmente `backend/server.js`:**

```javascript
// Comentar las líneas de rate limiting
// app.use("/api/auth/login", limiterAuth);
// app.use("/api/auth/registrar", limiterAuth);
```

**⚠️ NUNCA HACER ESTO EN PRODUCCIÓN**

---

## Ejecución de Tests Correcta

### Orden Recomendado (para evitar rate limits):

```powershell
# 1. Reiniciar servidor
node backend/server.js

# Esperar 3 segundos

# 2. Test de password policies (6 requests)
.\test-password-policies.ps1

# 3. Reiniciar servidor
# Ctrl+C → node backend/server.js

# 4. Test de logging (6 requests de auth)
.\test-logging.ps1

# 5. Reiniciar servidor
# Ctrl+C → node backend/server.js

# 6. Test de session management (4 requests de auth)
.\test-session-management.ps1

# 7. Reiniciar servidor
# Ctrl+C → node backend/server.js

# 8. Test de 2FA (2-3 requests de auth)
.\test-2fa.ps1
```

### Ejecutar Todos los Tests Juntos (Script Automatizado)

Crear `run-all-tests.ps1`:

```powershell
Write-Host "🧪 Ejecutando TODOS los tests de seguridad..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Password Policies
Write-Host "═══════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 1: Password Policies" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════" -ForegroundColor Yellow
.\test-password-policies.ps1
Write-Host "`nEsperando 16 minutos para reset de rate limit..." -ForegroundColor Yellow
Start-Sleep -Seconds 960

# Test 2: Logging
Write-Host "═══════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 2: Winston Logging" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════" -ForegroundColor Yellow
.\test-logging.ps1
Write-Host "`nEsperando 16 minutos para reset de rate limit..." -ForegroundColor Yellow
Start-Sleep -Seconds 960

# Test 3: Session Management
Write-Host "═══════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 3: Session Management" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════" -ForegroundColor Yellow
.\test-session-management.ps1
Write-Host "`nEsperando 16 minutos para reset de rate limit..." -ForegroundColor Yellow
Start-Sleep -Seconds 960

# Test 4: 2FA
Write-Host "═══════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 4: Two-Factor Authentication" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════" -ForegroundColor Yellow
.\test-2fa.ps1

Write-Host "`n🎉 TODOS LOS TESTS COMPLETADOS" -ForegroundColor Green
```

---

## Estado Actual de Tests

✅ **Test de Logging** - PASADO (primera ejecución)

- Login fallido registrado ✓
- Registro detectado ✓
- Login exitoso registrado ✓
- Token inválido detectado ✓
- Rate limiting detectado ✓

⏳ **Tests Bloqueados por Rate Limiting**

- Test de Password Policies
- Test de Session Management
- Test de 2FA

---

## Recomendación para Desarrollo

**Para testing continuo:**

1. Aumentar `limiterAuth.max` a 100 en development
2. Usar variable de entorno para controlar:

```javascript
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 5 : 100,
  skipSuccessfulRequests: true,
});
```

**En `.env`:**

```env
NODE_ENV=development  # Para testing
# NODE_ENV=production  # Para producción
```

Esto mantiene seguridad en producción pero permite testing en development.
