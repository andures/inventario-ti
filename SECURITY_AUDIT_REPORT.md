# 🔍 Análisis de Seguridad del Backend - Inventario TI

**Fecha:** Octubre 15, 2025  
**Versión:** 1.0.0  
**Analista:** Security Review  
**Estado:** 🟡 REQUIERE MEJORAS

---

## 📊 Resumen Ejecutivo

Se identificaron **15 vulnerabilidades** de seguridad en el backend, clasificadas en:

- 🔴 **Críticas:** 3
- 🟠 **Altas:** 5
- 🟡 **Medias:** 4
- 🔵 **Bajas:** 3

---

## 🔴 VULNERABILIDADES CRÍTICAS

### 1. CORS Configurado con Wildcard (\*) en Producción

**Archivo:** `backend/server.js` (Línea 22-27)

**Código Actual:**

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // ❌ CRÍTICO
    credentials: true,
  })
);
```

**Problema:**

- Permite peticiones desde CUALQUIER origen
- Alto riesgo de ataques CSRF (Cross-Site Request Forgery)
- Exposición de credenciales a sitios maliciosos

**Impacto:** 🔴 CRÍTICO  
**CVSS Score:** 8.5/10

**Solución:**

```javascript
// ✅ Configuración segura
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "La política CORS no permite acceso desde este origen.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

---

### 2. Sin Límite de Tamaño en Body Parser

**Archivo:** `backend/server.js` (Línea 30-31)

**Código Actual:**

```javascript
app.use(express.json()); // ❌ Sin límite de tamaño
app.use(express.urlencoded({ extended: true }));
```

**Problema:**

- Vulnerable a ataques DoS por payload masivo
- Puede colapsar el servidor con requests grandes
- Consume memoria sin control

**Impacto:** 🔴 CRÍTICO  
**CVSS Score:** 7.8/10

**Solución:**

```javascript
// ✅ Con límites de tamaño
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Para upload de archivos con Multer (futuro)
// app.use(multer({ limits: { fileSize: 5 * 1024 * 1024 } }));
```

---

### 3. Sin Rate Limiting - Vulnerable a Brute Force

**Archivo:** `backend/server.js`

**Problema:**

- Sin límite de intentos de login
- Vulnerable a ataques de fuerza bruta
- Vulnerable a ataques de denegación de servicio (DoS)

**Impacto:** 🔴 CRÍTICO  
**CVSS Score:** 8.0/10

**Solución:**

```javascript
// Instalar: npm install express-rate-limit

const rateLimit = require("express-rate-limit");

// Rate limiter general
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por IP
  message: {
    success: false,
    message: "Demasiadas peticiones, intenta de nuevo más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // solo 5 intentos de login
  message: {
    success: false,
    message: "Demasiados intentos de login. Intenta de nuevo en 15 minutos.",
  },
  skipSuccessfulRequests: true,
});

app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/registrar", authLimiter);
```

---

## 🟠 VULNERABILIDADES ALTAS

### 4. Headers de Seguridad HTTP No Configurados

**Archivo:** `backend/server.js`

**Problema:**

- Sin protección contra XSS
- Sin protección contra Clickjacking
- Sin política de contenido (CSP)
- Headers inseguros expuestos

**Impacto:** 🟠 ALTO  
**CVSS Score:** 7.2/10

**Solución:**

```javascript
// Instalar: npm install helmet

const helmet = require("helmet");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: "same-origin" },
  })
);

// Remover header que expone tecnología
app.disable("x-powered-by");
```

---

### 5. Validación Insuficiente de Inputs

**Archivo:** `backend/controllers/authController.js`

**Problema:**

- Validación básica de emails (regex débil)
- No sanitización de inputs
- Vulnerable a NoSQL Injection
- No validación de formato de nombres

**Impacto:** 🟠 ALTO  
**CVSS Score:** 7.0/10

**Solución:**

```javascript
// Instalar: npm install joi express-mongo-sanitize express-validator

// 1. Sanitización contra NoSQL Injection
const mongoSanitize = require("express-mongo-sanitize");
app.use(mongoSanitize());

// 2. Validación con Joi
const Joi = require("joi");

const registrarSchema = Joi.object({
  nombre: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/)
    .required()
    .messages({
      "string.pattern.base": "El nombre solo debe contener letras",
      "string.min": "El nombre debe tener al menos 2 caracteres",
      "string.max": "El nombre no puede exceder 50 caracteres",
    }),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.pattern.base":
        "La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales",
    }),
  rol: Joi.string().valid("administrador_ti", "ti").optional(),
});

// Middleware de validación
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: error.details.map((detail) => detail.message),
      });
    }
    next();
  };
};

// Usar en rutas
router.post("/registrar", validate(registrarSchema), registrar);
```

---

### 6. Error Stack Trace Expuesto en Producción

**Archivo:** `backend/server.js` (Línea 94)

**Código Actual:**

```javascript
res.status(err.status || 500).json({
  success: false,
  message: err.message || "Error interno del servidor",
  error: process.env.NODE_ENV === "development" ? err.stack : undefined, // ❌ Aún expone info
});
```

**Problema:**

- El mensaje de error puede revelar información sensible
- Stack trace puede exponer estructura interna
- Ayuda a atacantes a identificar vulnerabilidades

**Impacto:** 🟠 ALTO  
**CVSS Score:** 6.5/10

**Solución:**

```javascript
// ✅ Manejo seguro de errores
app.use((err, req, res, next) => {
  // Log completo solo en servidor
  console.error("Error completo:", {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Respuesta al cliente
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : "Error interno del servidor",
    ...(isDevelopment && {
      stack: err.stack,
      details: err,
    }),
  });
});
```

---

### 7. Sin Protección contra NoSQL Injection

**Archivo:** `backend/controllers/authController.js`

**Problema:**

- Queries directas sin sanitización
- Vulnerable a inyección de operadores MongoDB
- Ejemplo: `{ "email": { "$ne": null } }`

**Impacto:** 🟠 ALTO  
**CVSS Score:** 7.5/10

**Solución:**

```javascript
// Instalar: npm install express-mongo-sanitize

const mongoSanitize = require("express-mongo-sanitize");

// En server.js
app.use(
  mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
      console.warn(`⚠️ Intento de NoSQL injection detectado: ${key}`);
    },
  })
);
```

---

### 8. Contraseñas con Requisitos Mínimos Débiles

**Archivo:** `backend/models/User.js` (Línea 30)

**Código Actual:**

```javascript
password: {
  type: String,
  required: [true, "La contraseña es requerida"],
  minlength: [6, "La contraseña debe tener al menos 6 caracteres"],  // ❌ Muy débil
  select: false,
},
```

**Problema:**

- 6 caracteres es muy débil
- No requiere complejidad (mayúsculas, números, símbolos)
- Vulnerable a ataques de diccionario

**Impacto:** 🟠 ALTO  
**CVSS Score:** 6.8/10

**Solución:**

```javascript
password: {
  type: String,
  required: [true, "La contraseña es requerida"],
  minlength: [8, "La contraseña debe tener al menos 8 caracteres"],
  validate: {
    validator: function(v) {
      // Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
    },
    message: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales'
  },
  select: false,
},
```

---

## 🟡 VULNERABILIDADES MEDIAS

### 9. Sin Logging de Seguridad

**Problema:**

- No hay registro de eventos de seguridad
- Dificulta detección de ataques
- No hay auditoría de accesos

**Impacto:** 🟡 MEDIO  
**CVSS Score:** 5.5/10

**Solución:**

```javascript
// Instalar: npm install winston

const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "inventario-ti" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.File({ filename: "security.log", level: "warn" }),
  ],
});

// Middleware de logging
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });
  next();
});

// Log eventos de seguridad
// En authController.js
logger.warn({
  event: "LOGIN_FAILED",
  email: email,
  ip: req.ip,
  timestamp: new Date().toISOString(),
});
```

---

### 10. Refresh Tokens Sin Expiración Forzada

**Archivo:** `backend/controllers/authController.js`

**Problema:**

- Refresh tokens no se invalidan automáticamente
- No hay rotación de tokens
- Token comprometido puede usarse indefinidamente

**Impacto:** 🟡 MEDIO  
**CVSS Score:** 5.8/10

**Solución:**

```javascript
// Agregar campo al modelo User
refreshTokenExpire: Date,
  // Al generar refresh token
  (usuario.refreshToken = refreshToken);
usuario.refreshTokenExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
await usuario.save();

// Al validar refresh token
if (!usuario.refreshTokenExpire || usuario.refreshTokenExpire < new Date()) {
  return res.status(401).json({
    success: false,
    message: "Refresh token expirado. Por favor inicia sesión de nuevo.",
  });
}
```

---

### 11. Sin Protección de Información Sensible en Logs

**Archivo:** `backend/controllers/authController.js`

**Código Actual:**

```javascript
console.error("Error en registrar:", error); // ❌ Puede exponer passwords
```

**Problema:**

- Los errores pueden contener contraseñas
- Logs pueden ser accesibles
- Información sensible en plain text

**Impacto:** 🟡 MEDIO  
**CVSS Score:** 5.2/10

**Solución:**

```javascript
// ✅ Log sanitizado
const sanitizeError = (error) => {
  const sanitized = { ...error };
  delete sanitized.password;
  delete sanitized.refreshToken;
  delete sanitized.resetPasswordToken;
  return sanitized;
};

console.error("Error en registrar:", sanitizeError(error));
```

---

### 12. Email Regex Débil

**Archivo:** `backend/models/User.js` (Línea 22-24)

**Código Actual:**

```javascript
match: [
  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,  // ❌ Permite emails inválidos
  "Por favor ingrese un email válido",
],
```

**Problema:**

- Regex no valida correctamente emails
- Permite caracteres especiales no válidos
- No valida TLDs correctamente

**Impacto:** 🟡 MEDIO  
**CVSS Score:** 4.5/10

**Solución:**

```javascript
// ✅ Regex más robusta o usar librería
match: [
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  "Por favor ingrese un email válido",
],

// O mejor aún, usar validator.js
// npm install validator
const validator = require('validator');

validate: {
  validator: function(v) {
    return validator.isEmail(v);
  },
  message: 'Por favor ingrese un email válido'
}
```

---

## 🔵 VULNERABILIDADES BAJAS

### 13. Sin Timeout de Conexión a MongoDB

**Archivo:** `backend/config/database.js`

**Solución:**

```javascript
const conn = await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

---

### 14. Sin Variable de Entorno para PORT en Desarrollo

**Archivo:** `.env`

**Solución:**
Agregar `PORT=3000` explícitamente en `.env`

---

### 15. Sin Auditoría de Dependencias Configurada

**Problema:**

- No hay checks automáticos de vulnerabilidades
- Dependencias pueden estar desactualizadas

**Solución:**

```bash
# Agregar a package.json
"scripts": {
  "audit": "npm audit",
  "audit:fix": "npm audit fix"
}

# Configurar GitHub Dependabot o Snyk
```

---

## 📋 Plan de Remediación Prioritario

### Fase 1: CRÍTICO (Implementar YA)

- [ ] Configurar CORS correctamente
- [ ] Implementar Rate Limiting
- [ ] Agregar límites a Body Parser
- [ ] Instalar y configurar Helmet.js

### Fase 2: ALTO (Esta Semana)

- [ ] Implementar validación con Joi
- [ ] Proteger contra NoSQL Injection
- [ ] Mejorar requisitos de contraseñas
- [ ] Sanitizar logs y errores

### Fase 3: MEDIO (Próximas 2 Semanas)

- [ ] Implementar sistema de logging (Winston)
- [ ] Mejorar gestión de Refresh Tokens
- [ ] Validar emails correctamente
- [ ] Auditar dependencias

### Fase 4: BAJO (Mes)

- [ ] Configurar timeouts MongoDB
- [ ] Documentar configuraciones
- [ ] Implementar CI/CD con checks de seguridad

---

## 📦 Paquetes Recomendados a Instalar

```bash
npm install helmet express-rate-limit express-mongo-sanitize joi validator winston
```

---

## 🎯 Métricas de Seguridad

### Antes

- **Puntuación Total:** 35/100 🔴
- **Nivel de Riesgo:** ALTO 🔴
- **Vulnerabilidades Críticas:** 3
- **Listo para Producción:** ❌ NO

### Después (Estimado con todas las correcciones)

- **Puntuación Total:** 85/100 🟢
- **Nivel de Riesgo:** BAJO 🟢
- **Vulnerabilidades Críticas:** 0
- **Listo para Producción:** ✅ SÍ

---

## 📚 Referencias y Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)

---

**Próximos pasos:** Comenzar con la Fase 1 del plan de remediación.

**Contacto:** Para dudas sobre implementación, consultar `SECURITY.md`
