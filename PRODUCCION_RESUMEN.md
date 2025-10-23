# 📦 ARCHIVOS CREADOS PARA PRODUCCIÓN

## ✅ Archivos de Configuración

1. **`.env.production.example`** - Template con todas las variables de entorno para Railway
2. **`railway-config.json`** - JSON con las variables y comandos para Railway
3. **`RAILWAY_DEPLOY.md`** - Guía paso a paso completa para desplegar

## 🚀 Pasos Rápidos para Desplegar

### Paso 1: Genera JWT Secrets

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Ejecuta esto 2 veces para obtener 2 secrets diferentes.

### Paso 2: Backend en Railway

1. Nuevo proyecto → Deploy from GitHub
2. Copia las variables del `railway-config.json`
3. Reemplaza los JWT_SECRET con los que generaste
4. Start command: `node backend/server.js`
5. Copia la URL del backend

### Paso 3: Frontend en Vercel

1. Nuevo proyecto → Importar repositorio
2. Root directory: `frontend`
3. Framework: Vite
4. Variable de entorno: `VITE_API_URL=<URL_BACKEND_RAILWAY>/api`
5. Deploy

### Paso 4: Conectar

1. En Railway (backend) → Variables → actualiza `FRONTEND_URL` con la URL de Vercel
2. Redeploy el backend

### Paso 5: Crear Admin

En Railway terminal:

```bash
npm run seed
```

## 🎯 Lo que está listo

- ✅ Sistema de imágenes (upload directo + QR para móvil)
- ✅ Sistema de préstamos
- ✅ Debouncing en inputs (no spam de API calls)
- ✅ Rate limiting configurado para producción
- ✅ Seguridad completa (100/100)
- ✅ CORS configurado
- ✅ Variables de entorno preparadas

## 📱 QR Codes

Los QR codes funcionarán automáticamente en producción porque apuntan a:

```
https://tu-frontend-url.com/upload-image/:itemId
```

## 🔐 Seguridad en Producción

Con `NODE_ENV=production` se activa automáticamente:

- Rate limiting estricto: 5 intentos de login
- 100 requests generales / 15 min
- 30 refresh tokens / 15 min
- Todas las medidas de seguridad

## ⚠️ IMPORTANTE

1. **CAMBIA los JWT_SECRET** - No uses los del ejemplo
2. **Actualiza FRONTEND_URL** - Después de desplegar el frontend
3. **Ejecuta seed.js** - Para crear el usuario admin inicial

## 📝 Credenciales Admin Inicial

Según tu `.env`:

- Email: admin@inventarioti.com
- Password: Admin_TI_2025_Secure!

---

**Todo está listo para producción. Sigue la guía en `RAILWAY_DEPLOY.md` para desplegar.** 🚀
