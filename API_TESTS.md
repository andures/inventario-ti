# 🧪 Ejemplos de Pruebas para la API

## Usando VS Code REST Client o Thunder Client

### 1. Registrar Usuario TI

```http
POST http://localhost:3000/api/auth/registrar
Content-Type: application/json

{
  "nombre": "Carlos Tecnología",
  "email": "carlos@ti.com",
  "password": "123456",
  "rol": "ti"
}
```

### 2. Registrar Administrador TI

```http
POST http://localhost:3000/api/auth/registrar
Content-Type: application/json

{
  "nombre": "Admin TI",
  "email": "admin@ti.com",
  "password": "123456",
  "rol": "administrador_ti"
}
```

### 3. Login

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@ti.com",
  "password": "123456"
}
```

**Respuesta esperada:**

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "...",
      "nombre": "Admin TI",
      "email": "admin@ti.com",
      "rol": "administrador_ti",
      "activo": true,
      "createdAt": "..."
    },
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "eyJhbGciOiJIUzI1..."
  }
}
```

### 4. Obtener Usuario Actual

```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer TU_ACCESS_TOKEN
```

### 5. Renovar Token

```http
POST http://localhost:3000/api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "TU_REFRESH_TOKEN"
}
```

### 6. Recuperar Contraseña

```http
POST http://localhost:3000/api/auth/olvide-password
Content-Type: application/json

{
  "email": "admin@ti.com"
}
```

### 7. Resetear Contraseña

```http
PUT http://localhost:3000/api/auth/reset-password/TOKEN_DEL_EMAIL
Content-Type: application/json

{
  "password": "nueva_password_123"
}
```

### 8. Listar Todos los Usuarios (Solo Admin)

```http
GET http://localhost:3000/api/users
Authorization: Bearer TU_ACCESS_TOKEN
```

### 9. Obtener Usuario por ID (Solo Admin)

```http
GET http://localhost:3000/api/users/USER_ID
Authorization: Bearer TU_ACCESS_TOKEN
```

### 10. Cambiar Rol de Usuario (Solo Admin)

```http
PUT http://localhost:3000/api/users/USER_ID/rol
Authorization: Bearer TU_ACCESS_TOKEN
Content-Type: application/json

{
  "rol": "administrador_ti"
}
```

### 11. Desactivar Usuario (Solo Admin)

```http
PUT http://localhost:3000/api/users/USER_ID/estado
Authorization: Bearer TU_ACCESS_TOKEN
Content-Type: application/json

{
  "activo": false
}
```

### 12. Eliminar Usuario (Solo Admin)

```http
DELETE http://localhost:3000/api/users/USER_ID
Authorization: Bearer TU_ACCESS_TOKEN
```

### 13. Cerrar Sesión

```http
POST http://localhost:3000/api/auth/logout
Authorization: Bearer TU_ACCESS_TOKEN
```

### 14. Health Check

```http
GET http://localhost:3000/api/health
```

---

## Usando cURL (Terminal/PowerShell)

### Registrar Usuario

```powershell
curl -X POST http://localhost:3000/api/auth/registrar `
  -H "Content-Type: application/json" `
  -d '{\"nombre\":\"Test User\",\"email\":\"test@ti.com\",\"password\":\"123456\",\"rol\":\"ti\"}'
```

### Login

```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@ti.com\",\"password\":\"123456\"}'
```

### Obtener Usuario Actual (reemplaza TU_TOKEN)

```powershell
curl -X GET http://localhost:3000/api/auth/me `
  -H "Authorization: Bearer TU_TOKEN"
```

---

## Notas Importantes

1. **Access Token**: Expira en 15 minutos (configurable en .env)
2. **Refresh Token**: Expira en 7 días (configurable en .env)
3. **Reset Password Token**: Expira en 10 minutos
4. Guarda el `accessToken` después del login para usarlo en las peticiones protegidas
5. Los endpoints de `/api/users` solo están disponibles para usuarios con rol `administrador_ti`

## Códigos de Estado HTTP

- `200` - OK
- `201` - Created (recurso creado exitosamente)
- `400` - Bad Request (error en los datos enviados)
- `401` - Unauthorized (no autenticado o token inválido)
- `403` - Forbidden (no tienes permisos)
- `404` - Not Found (recurso no encontrado)
- `500` - Internal Server Error (error del servidor)

## Flujo de Autenticación Recomendado

1. **Registrar** o hacer **Login**
2. Guardar `accessToken` y `refreshToken`
3. Usar `accessToken` en las peticiones con header: `Authorization: Bearer {accessToken}`
4. Cuando el `accessToken` expire (401), usar el endpoint `/api/auth/refresh-token` con el `refreshToken`
5. Actualizar el `accessToken` con el nuevo token recibido
6. Continuar haciendo peticiones con el nuevo `accessToken`
