# 🔧 Solución de Problemas - Inventario TI

## ❌ Error: Could not connect to MongoDB Atlas

### Problema

```
Error conectando a MongoDB: Could not connect to any servers in your MongoDB Atlas cluster.
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

### Solución

#### Opción 1: Agregar tu IP actual (Recomendado para desarrollo)

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto
4. En el menú lateral, haz clic en **"Network Access"**
5. Haz clic en **"Add IP Address"**
6. Tienes dos opciones:
   - **Add Current IP Address**: Agrega tu IP actual automáticamente
   - **Allow Access from Anywhere**: Agrega `0.0.0.0/0` (⚠️ Solo para desarrollo, NO para producción)
7. Haz clic en **"Confirm"**
8. Espera unos segundos a que se aplique el cambio

#### Opción 2: Permitir acceso desde cualquier IP (Solo desarrollo)

1. Ve a MongoDB Atlas → Network Access
2. Add IP Address
3. Selecciona "Allow Access from Anywhere"
4. Esto agregará `0.0.0.0/0`
5. Confirmar

⚠️ **Nota de Seguridad**: Esta opción solo debe usarse en desarrollo. En producción, siempre especifica las IPs exactas que necesitan acceso.

#### Opción 3: Usar MongoDB Local (Alternativa)

Si prefieres trabajar con MongoDB local en lugar de Atlas:

1. **Instalar MongoDB Community**

   - Descarga desde: https://www.mongodb.com/try/download/community
   - Instala siguiendo las instrucciones

2. **Iniciar MongoDB**

   ```powershell
   # Windows
   net start MongoDB

   # O desde MongoDB Compass
   ```

3. **Actualizar .env**
   ```env
   MONGO_URI=mongodb://localhost:27017/inventario_ti
   ```

### Verificar Conexión

Después de aplicar cualquiera de las soluciones:

1. **Reinicia el servidor**

   ```powershell
   npm run dev
   ```

2. **Verifica en la consola**
   Deberías ver:

   ```
   ✅ MongoDB Conectado: cluster0-shard-00-00.a5igzmz.mongodb.net
   ```

3. **Prueba el health check**

   ```powershell
   curl http://localhost:3000/api/health
   ```

   Respuesta esperada:

   ```json
   {
     "success": true,
     "status": "OK",
     "database": "Connected"
   }
   ```

### Crear Usuario Administrador

Una vez conectado a MongoDB, ejecuta:

```powershell
npm run seed
```

Deberías ver:

```
✅ Conectado a MongoDB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Usuario administrador creado exitosamente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: admin@inventarioti.com
🔑 Password: admin123456
👤 Rol: administrador_ti
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🧪 Probar la API

### 1. Health Check

```powershell
curl http://localhost:3000/api/health
```

### 2. Login con Admin

```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@inventarioti.com\",\"password\":\"admin123456\"}'
```

### 3. Guardar el token

Copia el `accessToken` de la respuesta y úsalo en las siguientes peticiones.

### 4. Obtener perfil

```powershell
curl -X GET http://localhost:3000/api/auth/me `
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

## 📧 Configuración de Email (Gmail)

Si quieres probar la recuperación de contraseña:

1. **Habilitar 2FA en Gmail**

   - Ve a https://myaccount.google.com/security
   - Activa la "Verificación en dos pasos"

2. **Crear contraseña de aplicación**

   - En la misma página, busca "Contraseñas de aplicaciones"
   - Selecciona "Correo" y genera una contraseña
   - Copia la contraseña generada

3. **Actualizar .env**

   ```env
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASSWORD=la_contraseña_de_aplicacion_generada
   EMAIL_FROM=Inventario TI <tu_correo@gmail.com>
   ```

4. **Reiniciar servidor**
   ```powershell
   npm run dev
   ```

## 🔄 Otros Problemas Comunes

### Puerto 3000 en uso

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución:**

```powershell
# Ver qué proceso está usando el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID <PID> /F

# O cambiar el puerto en .env
PORT=3001
```

### Módulos no encontrados

```
Error: Cannot find module 'express'
```

**Solución:**

```powershell
npm install
```

### Problemas con nodemon

```powershell
# Reinstalar nodemon
npm install --save-dev nodemon

# O ejecutar sin nodemon
npm start
```

## 📞 Contacto y Soporte

Si sigues teniendo problemas:

1. Verifica que todas las dependencias estén instaladas
2. Verifica que el archivo .env esté configurado correctamente
3. Revisa los logs del servidor en la terminal
4. Verifica la conexión a internet

## ✅ Checklist de Verificación

- [ ] MongoDB Atlas configurado con IP whitelisted
- [ ] Variables de entorno en .env correctas
- [ ] Dependencias instaladas (`npm install`)
- [ ] Servidor corriendo (`npm run dev`)
- [ ] Conexión a MongoDB exitosa (✅ en consola)
- [ ] Usuario admin creado (`npm run seed`)
- [ ] Login funciona (POST /api/auth/login)
- [ ] Puedes acceder a rutas protegidas con token

Si todos estos pasos están completos, ¡tu sistema está listo para usar! 🎉
