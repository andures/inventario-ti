# 🔐 Guía de Seguridad - Inventario TI

## 📋 Contenido

- [Configuración Segura](#configuración-segura)
- [Variables de Entorno](#variables-de-entorno)
- [Contraseñas](#contraseñas)
- [JWT y Tokens](#jwt-y-tokens)
- [MongoDB](#mongodb)
- [Email](#email)
- [Producción](#producción)
- [Checklist de Seguridad](#checklist-de-seguridad)

---

## 🔧 Configuración Segura

### 1. Variables de Entorno

**❌ NO HACER:**

```javascript
// NUNCA hardcodear credenciales en el código
const password = "admin123456";
const jwtSecret = "mi_secreto";
```

**✅ HACER:**

```javascript
// Siempre usar variables de entorno
const password = process.env.ADMIN_PASSWORD;
const jwtSecret = process.env.JWT_SECRET;
```

### 2. Archivo .env

**Estructura correcta del .env:**

```env
# ============================================
# MONGODB
# ============================================
MONGO_URI=mongodb+srv://user:strongpassword@cluster.mongodb.net/db?retryWrites=true&w=majority

# ============================================
# JWT
# ============================================
JWT_SECRET=clave_super_secreta_minimo_32_caracteres_aleatorios_abc123xyz
JWT_REFRESH_SECRET=otra_clave_diferente_minimo_32_caracteres_def456uvw
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# ============================================
# ADMIN INICIAL
# ============================================
ADMIN_NOMBRE=Administrador TI
ADMIN_EMAIL=admin@empresa.com
ADMIN_PASSWORD=P@ssw0rd!Segur0*2025
```

**⚠️ Reglas importantes:**

1. **NUNCA** subir `.env` a Git
2. Usar `.env.example` como plantilla (sin valores reales)
3. Cada desarrollador debe tener su propio `.env`
4. Diferentes valores para desarrollo, staging y producción
5. Rotar secretos periódicamente

---

## 🔑 Contraseñas

### Requisitos Mínimos

- ✅ Mínimo 8 caracteres
- ✅ Incluir mayúsculas y minúsculas
- ✅ Incluir números
- ✅ Incluir caracteres especiales (!@#$%^&\*)
- ✅ No usar palabras del diccionario
- ✅ No usar información personal

### Ejemplos

**❌ Contraseñas débiles:**

- `123456`
- `password`
- `admin`
- `qwerty`
- `admin123`

**✅ Contraseñas fuertes:**

- `P@ssw0rd!Segur0*2025`
- `Admin_TI_2025_Secure!`
- `7k$Hp9@mQ2vL!nX5`

### Generar Contraseñas Seguras

**Node.js (Terminal):**

```javascript
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**PowerShell:**

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | % {[char]$_})
```

**Online (recomendado):**

- https://www.grc.com/passwords.htm
- https://bitwarden.com/password-generator/

---

## 🎫 JWT y Tokens

### Configuración Segura

**Secretos JWT:**

```javascript
// Generar secretos seguros (32+ caracteres aleatorios)
JWT_SECRET=a8f5c2e9d4b7f1e6c3a9d2b8e7f4a1c6b9d3e8f2a7c4e1b6d9f3a8e2c7b1f4d
JWT_REFRESH_SECRET=9e4b1c7a3f8d2e6b5a9c1f7d3e8b2a6c4f9e1d7b3a8c5e2f6b9d1a4c7e3f8b
```

**Tiempos de expiración:**

```env
# Access Token: Corto (15 minutos - 1 hora)
JWT_EXPIRE=15m

# Refresh Token: Largo (7 días - 30 días)
JWT_REFRESH_EXPIRE=7d
```

### Mejores Prácticas

1. **Diferentes secretos** para access y refresh tokens
2. **Rotación** de tokens después de cambios críticos
3. **Invalidación** de tokens al cerrar sesión
4. **No guardar** información sensible en el payload
5. **Usar HTTPS** siempre en producción

---

## 🍃 MongoDB

### Seguridad de Conexión

**✅ Buenas prácticas:**

1. **Usar MongoDB Atlas** (recomendado)
2. **Configurar IP Whitelist** correctamente
3. **Usuario y contraseña fuertes**
4. **Conexión con TLS/SSL**
5. **No exponer puerto 27017** directamente

### IP Whitelist

**Desarrollo:**

```
0.0.0.0/0 (Permitir todas las IPs)
```

**Producción:**

```
Solo IPs específicas de tu servidor
Ejemplo: 192.168.1.100/32
```

### String de Conexión Seguro

```env
# ✅ Correcto
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/db?retryWrites=true&w=majority

# ❌ Incorrecto (sin autenticación)
MONGO_URI=mongodb://localhost:27017/db
```

---

## 📧 Email

### Gmail - Contraseñas de Aplicación

**Pasos:**

1. Activar verificación en 2 pasos
2. Ir a: https://myaccount.google.com/apppasswords
3. Seleccionar "Correo" y "Otro dispositivo"
4. Copiar la contraseña de 16 dígitos
5. Usar esa contraseña en `EMAIL_PASSWORD`

**⚠️ Nunca uses tu contraseña de Gmail directamente**

```env
# ❌ NO
EMAIL_PASSWORD=mi_password_de_gmail

# ✅ SI
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

---

## 🚀 Producción

### Checklist Pre-Producción

- [ ] Todas las credenciales en variables de entorno
- [ ] Secretos JWT únicos y seguros (32+ caracteres)
- [ ] `NODE_ENV=production`
- [ ] HTTPS habilitado
- [ ] CORS configurado correctamente
- [ ] Rate limiting implementado
- [ ] Logs de seguridad activados
- [ ] Backup automático de base de datos
- [ ] Contraseñas de admin cambiadas
- [ ] IP Whitelist configurada en MongoDB
- [ ] Certificados SSL válidos
- [ ] Actualizaciones de dependencias al día
- [ ] Variables de entorno diferentes a desarrollo

### Variables de Entorno en Producción

**Heroku:**

```bash
heroku config:set JWT_SECRET=valor_secreto
heroku config:set MONGO_URI=connection_string
```

**Vercel:**

```bash
vercel env add JWT_SECRET
vercel env add MONGO_URI
```

**Docker:**

```yaml
environment:
  - JWT_SECRET=${JWT_SECRET}
  - MONGO_URI=${MONGO_URI}
```

### Configuración de NODE_ENV

```env
# Desarrollo
NODE_ENV=development

# Producción
NODE_ENV=production
```

---

## ✅ Checklist de Seguridad

### Básico

- [ ] `.env` en `.gitignore`
- [ ] `.env.example` creado (sin valores reales)
- [ ] Contraseñas hasheadas con bcrypt
- [ ] JWT con expiración
- [ ] Validación de inputs
- [ ] Manejo de errores sin exponer información sensible

### Intermedio

- [ ] HTTPS en producción
- [ ] CORS configurado correctamente
- [ ] Rate limiting (express-rate-limit)
- [ ] Helmet.js para headers de seguridad
- [ ] Logs de seguridad
- [ ] Backup automático de base de datos
- [ ] Diferentes credenciales por entorno

### Avanzado

- [ ] Auditoría de dependencias (npm audit)
- [ ] WAF (Web Application Firewall)
- [ ] Monitoreo de seguridad
- [ ] Tests de penetración
- [ ] Rotación de secretos automática
- [ ] 2FA para usuarios admin
- [ ] Encriptación de datos sensibles en BD

---

## 🛡️ Herramientas Recomendadas

### Análisis de Seguridad

```bash
# Auditar dependencias
npm audit

# Corregir vulnerabilidades
npm audit fix

# Análisis profundo
npm audit fix --force
```

### Librerías Adicionales

```bash
# Seguridad de headers HTTP
npm install helmet

# Rate limiting
npm install express-rate-limit

# Validación de inputs
npm install joi

# Sanitización de datos
npm install express-mongo-sanitize
```

---

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)

---

## 🚨 Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor:

1. **NO** abras un issue público
2. Contacta al equipo de desarrollo directamente
3. Proporciona detalles del problema
4. Espera confirmación antes de divulgar públicamente

---

**Última actualización:** Octubre 2025

**Recuerda:** La seguridad es un proceso continuo, no un estado final.
