# 📂 Estructura del Proyecto - Inventario TI

```
inventario-ti/
│
├── backend/                          # Carpeta principal del backend
│   │
│   ├── config/                       # Configuraciones
│   │   ├── database.js              # Configuración de conexión a MongoDB
│   │   └── constants.js             # Constantes y enums de la aplicación
│   │
│   ├── controllers/                  # Controladores (Lógica de negocio)
│   │   ├── authController.js        # Registro, login, recuperación de password
│   │   └── userController.js        # Gestión de usuarios (CRUD)
│   │
│   ├── middleware/                   # Middlewares personalizados
│   │   └── auth.js                  # Autenticación y autorización (JWT)
│   │
│   ├── models/                       # Modelos de Mongoose (Schemas)
│   │   └── User.js                  # Modelo de Usuario
│   │
│   ├── routes/                       # Definición de rutas
│   │   ├── authRoutes.js            # Rutas de autenticación
│   │   └── userRoutes.js            # Rutas de gestión de usuarios
│   │
│   ├── utils/                        # Utilidades y helpers
│   │   ├── jwtUtils.js              # Generación y verificación de tokens JWT
│   │   └── sendEmail.js             # Envío de emails (Nodemailer)
│   │
│   └── server.js                     # Punto de entrada de la aplicación
│
├── frontend/                         # Carpeta para el frontend (futuro)
│
├── .env                              # Variables de entorno (NO subir a Git)
├── .gitignore                        # Archivos ignorados por Git
├── API_TESTS.md                      # Ejemplos de peticiones a la API
├── package.json                      # Dependencias y scripts de npm
├── README.md                         # Documentación principal
├── seed.js                           # Script para crear admin inicial
└── STRUCTURE.md                      # Este archivo
```

## 📋 Descripción de Carpetas y Archivos

### `backend/config/`

Contiene todas las configuraciones centralizadas de la aplicación:

- **database.js**: Conexión a MongoDB con Mongoose
- **constants.js**: Constantes, roles, estados, mensajes predefinidos

### `backend/controllers/`

Lógica de negocio de la aplicación:

- **authController.js**:

  - Registro de usuarios
  - Login
  - Refresh token
  - Recuperación de contraseña
  - Reset de contraseña
  - Logout
  - Obtener usuario actual

- **userController.js**:
  - Listar usuarios (con filtros)
  - Obtener usuario por ID
  - Actualizar rol de usuario
  - Activar/desactivar usuario
  - Eliminar usuario

### `backend/middleware/`

Funciones que se ejecutan entre la petición y la respuesta:

- **auth.js**:
  - `protect`: Verifica que el usuario esté autenticado (JWT)
  - `authorize`: Verifica que el usuario tenga el rol requerido

### `backend/models/`

Esquemas de datos (Mongoose):

- **User.js**:
  - Define la estructura de los usuarios
  - Métodos de encriptación de contraseñas
  - Validaciones de campos
  - Métodos personalizados (compararPassword, obtenerDatosPublicos)

### `backend/routes/`

Definición de endpoints de la API:

- **authRoutes.js**: Rutas públicas y privadas de autenticación
- **userRoutes.js**: Rutas privadas de gestión de usuarios (solo admin)

### `backend/utils/`

Funciones auxiliares reutilizables:

- **jwtUtils.js**: Manejo de tokens JWT (generar, verificar)
- **sendEmail.js**: Envío de correos electrónicos

### Archivos raíz

- **server.js**: Inicializa Express, conecta a MongoDB, define middlewares globales
- **seed.js**: Crea el usuario administrador inicial
- **.env**: Variables de entorno (credenciales, configuraciones)
- **package.json**: Dependencias del proyecto
- **README.md**: Documentación completa del proyecto
- **API_TESTS.md**: Ejemplos de uso de la API

## 🔄 Flujo de una Petición

```
Cliente
   ↓
Request (HTTP)
   ↓
server.js → Middlewares globales (CORS, JSON parser)
   ↓
Routes (authRoutes.js o userRoutes.js)
   ↓
Middleware (auth.js) → Verifica JWT y permisos
   ↓
Controller (authController.js o userController.js)
   ↓
Model (User.js) → Interacción con MongoDB
   ↓
Response (JSON)
   ↓
Cliente
```

## 🎯 Convenciones y Buenas Prácticas

### Nomenclatura

- **Archivos**: camelCase (userController.js)
- **Variables/Funciones**: camelCase (obtenerUsuarios)
- **Constantes**: UPPER_SNAKE_CASE (JWT_SECRET)
- **Modelos**: PascalCase (User)

### Estructura de Respuestas

Todas las respuestas de la API siguen este formato:

```javascript
// Éxito
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Mensaje de error",
  "error": "Detalles del error (solo en desarrollo)"
}
```

### Manejo de Errores

- Try-catch en todos los controllers
- Logs de errores con console.error
- Mensajes claros para el usuario
- Stack trace solo en desarrollo

### Seguridad

- Contraseñas hasheadas (bcryptjs)
- Tokens JWT con expiración
- Variables sensibles en .env
- Validación de inputs
- CORS configurado
- Select false en campos sensibles

### Código Limpio

- Comentarios JSDoc en funciones importantes
- Funciones pequeñas y específicas
- Nombres descriptivos
- Separación de responsabilidades
- DRY (Don't Repeat Yourself)

## 📊 Modelos de Datos

### Usuario (User)

```javascript
{
  nombre: String,
  email: String (único, lowercase),
  password: String (hasheado, select: false),
  rol: String (administrador_ti | ti),
  activo: Boolean,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  refreshToken: String,
  createdAt: Date (automático),
  updatedAt: Date (automático)
}
```

## 🔐 Roles y Permisos

### administrador_ti

- ✅ Todos los permisos de "ti"
- ✅ Listar usuarios
- ✅ Ver detalles de usuarios
- ✅ Cambiar rol de usuarios
- ✅ Activar/desactivar usuarios
- ✅ Eliminar usuarios

### ti

- ✅ Login
- ✅ Ver su propio perfil
- ✅ Actualizar su propia información
- ✅ Logout
- ✅ Recuperar contraseña

## 🚀 Scripts Disponibles

```bash
npm run dev      # Modo desarrollo (nodemon)
npm start        # Modo producción
npm run seed     # Crear admin inicial
npm test         # Tests (pendiente)
```

## 📝 Próximas Mejoras

- [ ] Modelo de Items (equipos de inventario)
- [ ] Upload de imágenes con Multer
- [ ] Sistema de logs (winston)
- [ ] Rate limiting
- [ ] Paginación avanzada
- [ ] Filtros y búsqueda
- [ ] Tests unitarios (Jest)
- [ ] Tests de integración
- [ ] Documentación con Swagger
- [ ] Frontend (React/Vue)
