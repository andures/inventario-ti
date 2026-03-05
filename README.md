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


## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 👨‍💻 Autor

Andres Carias

## 🐛 Reportar Bugs

Si encuentras algún bug, por favor crea un issue en GitHub.

---

⭐ Si este proyecto te fue útil, dale una estrella en GitHub!
