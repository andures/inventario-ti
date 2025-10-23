# 🚀 Guía de Despliegue en Railway

## 📦 Preparación

### 1. Genera JWT Secrets Seguros

Ejecuta esto en tu terminal (2 veces, para generar 2 secrets diferentes):

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Guarda los resultados para usar como `JWT_SECRET` y `JWT_REFRESH_SECRET`.

---

## 🎯 Despliegue del BACKEND

### 1. Crea un nuevo proyecto en Railway

- Ve a https://railway.app
- Click en "New Project"
- Selecciona "Deploy from GitHub repo"
- Conecta tu repositorio

### 2. Configura las Variables de Entorno

En Railway, ve a tu proyecto → Variables → Raw Editor y pega:

```
MONGO_URI=mongodb+srv://andrescarias1_db_user:0HHZ2hhBp7aTe8l2@cluster0.a5igzmz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=3000
JWT_SECRET=<TU_SECRET_GENERADO_1>
JWT_REFRESH_SECRET=<TU_SECRET_GENERADO_2>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=inamicrew@gmail.com
EMAIL_PASSWORD=inami2025.
EMAIL_FROM=Inventario TI <inamicrew@gmail.com>
NODE_ENV=production
FRONTEND_URL=<PENDIENTE_AGREGAR_DESPUES>
ADMIN_NOMBRE=Administrador TI
ADMIN_EMAIL=admin@inventarioti.com
ADMIN_PASSWORD=Admin_TI_2025_Secure!
```

### 3. Configura el Start Command

En Settings → Deploy:

- **Build Command**: `npm install`
- **Start Command**: `node backend/server.js`
- **Root Directory**: `/` (raíz del proyecto)

### 4. Despliega

- Click en "Deploy"
- Espera a que termine
- **Copia la URL del backend** (ej: `https://inventario-ti-backend.up.railway.app`)

---

## 🎨 Despliegue del FRONTEND

### Opción A: Vercel (Recomendado para frontend)

1. Ve a https://vercel.com
2. "Add New" → "Project"
3. Importa tu repositorio
4. Configura:

   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Variables de entorno en Vercel:

```
VITE_API_URL=<URL_DE_TU_BACKEND_RAILWAY>
```

6. Actualiza `frontend/src/config/config.ts`:

```typescript
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";
```

7. Despliega

### Opción B: Railway (también funciona)

1. Crea otro proyecto en Railway
2. Configura:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve dist -l 3000`

---

## 🔗 Conectar Backend y Frontend

### 1. Actualiza FRONTEND_URL en Railway (Backend)

- Ve a tu backend en Railway → Variables
- Actualiza `FRONTEND_URL` con la URL de tu frontend
- Ejemplo: `https://inventario-ti.vercel.app`

### 2. Actualiza CORS en el backend

El archivo `backend/server.js` ya tiene configurado CORS para aceptar `process.env.FRONTEND_URL`.

### 3. Reinicia los servicios

- Backend: se reiniciará automáticamente
- Frontend: redeploy si es necesario

---

## ✅ Verificación

1. Visita tu frontend: `https://tu-frontend.vercel.app`
2. Intenta hacer login
3. Verifica que se pueda:
   - Crear dispositivos en inventario
   - Subir imágenes
   - Crear reparaciones
   - Los QR codes ahora funcionarán con URLs públicas

---

## 🔒 Seguridad en Producción

El sistema ya tiene configurado:

- ✅ Rate limiting estricto (5 intentos de login)
- ✅ CORS configurado
- ✅ Helmet.js (security headers)
- ✅ Input validation (Joi)
- ✅ NoSQL injection protection
- ✅ Session management
- ✅ Password policies
- ✅ 2FA disponible

Todo esto se activa automáticamente con `NODE_ENV=production`.

---

## 📝 Crear Usuario Administrador Inicial

Después del primer despliegue, ejecuta en Railway (Terminal):

```bash
npm run seed
```

Esto creará el usuario admin con las credenciales del .env.

---

## 🐛 Troubleshooting

### Backend no inicia

- Verifica que `MONGO_URI` esté correcta
- Revisa los logs en Railway
- Asegúrate que el start command sea: `node backend/server.js`

### Frontend no se conecta al backend

- Verifica CORS (FRONTEND_URL en backend)
- Revisa `VITE_API_URL` en Vercel
- Comprueba que el backend esté corriendo

### Error de JWT

- Verifica que JWT_SECRET tenga al menos 32 caracteres
- Genera nuevos secrets si es necesario

---

## 📞 Soporte

Si algo no funciona:

1. Revisa los logs en Railway/Vercel
2. Verifica todas las variables de entorno
3. Asegúrate que las URLs estén correctas (sin "/" al final)
