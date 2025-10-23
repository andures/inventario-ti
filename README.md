# 🖥️ Sistema de Inventario TI

Sistema de gestión de inventario para equipos de tecnología con autenticación JWT y recuperación de contraseña.

## 📋 Características

- ✅ Autenticación con JWT (Access Token y Refresh Token)
- ✅ Sistema de roles (administrador_ti y ti)
- ✅ Recuperación de contraseña por email
- ✅ Gestión de usuarios
- ✅ API RESTful
- ✅ Validaciones y manejo de errores

## 🛠️ Tecnologías

- Node.js
- Express.js
- MongoDB / Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Nodemailer
- CORS

## 📁 Estructura del Proyecto

```
inventario-ti/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuración de MongoDB
│   ├── controllers/
│   │   ├── authController.js    # Lógica de autenticación
│   │   └── userController.js    # Lógica de gestión de usuarios
│   ├── middleware/
│   │   └── auth.js              # Middleware de autenticación
│   ├── models/
│   │   └── User.js              # Modelo de Usuario
│   ├── routes/
│   │   ├── authRoutes.js        # Rutas de autenticación
│   │   └── userRoutes.js        # Rutas de usuarios
│   ├── utils/
│   │   ├── jwtUtils.js          # Utilidades JWT
│   │   └── sendEmail.js         # Utilidad de envío de emails
│   └── server.js                # Punto de entrada
├── .env                          # Variables de entorno
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Instalación

1. **Clonar el repositorio**

```bash
git clone <tu-repo>
cd inventario-ti
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Copiar el archivo de ejemplo y configurar con tus valores:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales reales:

```env
# MongoDB
MONGO_URI=tu_mongodb_uri_aqui

# Puerto
PORT=3000

# JWT Secrets - USAR CLAVES SEGURAS EN PRODUCCIÓN
JWT_SECRET=clave_secreta_muy_segura_minimo_32_caracteres
JWT_REFRESH_SECRET=clave_refresh_secreta_muy_segura_minimo_32_caracteres
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion_de_16_digitos
EMAIL_FROM=Inventario TI <tu_correo@gmail.com>

# Ambiente
NODE_ENV=development

# Usuario Administrador Inicial
ADMIN_NOMBRE=Administrador TI
ADMIN_EMAIL=admin@tuempresa.com
ADMIN_PASSWORD=PasswordSegura!2025
```

**⚠️ IMPORTANTE - Seguridad:**

- El archivo `.env` contiene credenciales sensibles
- **NUNCA** subas el `.env` a Git (ya está en `.gitignore`)
- Usa contraseñas fuertes (mínimo 8 caracteres)
- Genera claves JWT seguras: https://www.grc.com/passwords.htm
- Cambia las credenciales por defecto en producción

# MongoDB

MONGO_URI=tu_mongodb_uri

# Puerto

PORT=3000

# JWT

JWT_SECRET=tu_clave_secreta_muy_segura
JWT_REFRESH_SECRET=tu_clave_refresh_secreta
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email (Gmail)

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
EMAIL_FROM=Inventario TI <tu_correo@gmail.com>

# Ambiente

NODE_ENV=development

````

4. **Iniciar el servidor**

Desarrollo:

```bash
npm run dev
````

Producción:

```bash
npm start
```

## 📌 API Endpoints

### Autenticación

#### Registrar Usuario

```http
POST /api/auth/registrar
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "123456",
  "rol": "ti"
}
```

#### Iniciar Sesión

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "123456"
}
```

#### Renovar Token

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "tu_refresh_token"
}
```

#### Recuperar Contraseña

```http
POST /api/auth/olvide-password
Content-Type: application/json

{
  "email": "juan@example.com"
}
```

#### Resetear Contraseña

```http
PUT /api/auth/reset-password/:resettoken
Content-Type: application/json

{
  "password": "nueva_contraseña"
}
```

#### Obtener Usuario Actual

```http
GET /api/auth/me
Authorization: Bearer {access_token}
```

#### Cerrar Sesión

```http
POST /api/auth/logout
Authorization: Bearer {access_token}
```

### Gestión de Usuarios (Solo administrador_ti)

#### Listar Usuarios

```http
GET /api/users
Authorization: Bearer {access_token}

# Con filtros opcionales
GET /api/users?rol=ti&activo=true
```

#### Obtener Usuario por ID

```http
GET /api/users/:id
Authorization: Bearer {access_token}
```

#### Cambiar Rol de Usuario

```http
PUT /api/users/:id/rol
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "rol": "administrador_ti"
}
```

#### Activar/Desactivar Usuario

```http
PUT /api/users/:id/estado
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "activo": false
}
```

#### Eliminar Usuario

```http
DELETE /api/users/:id
Authorization: Bearer {access_token}
```

## 👥 Roles

- **administrador_ti**: Acceso completo, puede gestionar usuarios
- **ti**: Usuario estándar del equipo de TI

## 🔐 Seguridad

- Contraseñas hasheadas con bcryptjs
- JWT con expiración
- Refresh tokens para renovación segura
- Tokens de reseteo con expiración de 10 minutos
- Validación de inputs
- CORS configurado

## 📧 Configuración de Email (Gmail)

1. Activar verificación en 2 pasos en tu cuenta de Gmail
2. Generar una contraseña de aplicación:
   - Ve a: https://myaccount.google.com/security
   - Busca "Contraseñas de aplicaciones"
   - Genera una nueva para "Correo"
   - Usa esa contraseña en `EMAIL_PASSWORD`

## 🧪 Testing

Para probar los endpoints, puedes usar:

- Postman
- Thunder Client (extensión VS Code)
- cURL

Ejemplo con cURL:

```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test User","email":"test@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

## 📝 Scripts

```bash
# Desarrollo con nodemon
npm run dev

# Producción
npm start

# Testing
npm test
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

ISC

## 👨‍💻 Autor

Tu Nombre - [tu-email@example.com]

## 🐛 Reportar Bugs

Si encuentras algún bug, por favor crea un issue en GitHub.

---

⭐ Si este proyecto te fue útil, dale una estrella en GitHub!
