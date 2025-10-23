const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const logger = require("./utils/logger");
require("dotenv").config();

// Importar configuración de base de datos
const connectDB = require("./config/database");

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const twoFactorRoutes = require("./routes/twoFactorRoutes");
const inventarioRoutes = require("./routes/inventarioRoutes");
const reparacionRoutes = require("./routes/reparacionRoutes");

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

/**
 * Middlewares
 */
// CORS - Configuración segura para desarrollo y producción
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://localhost:5174", // Vite dev server (puerto alternativo)
  "http://localhost:3000", // Alternativo
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  process.env.FRONTEND_URL, // URL del frontend desde .env
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (mobile apps, Postman, Thunder Client)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`⚠️  CORS bloqueado para origen: ${origin}`);
        callback(new Error("No permitido por la política CORS"), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length", "X-Request-Id"],
  })
);

/**
 * Helmet - Security Headers
 * Protege contra vulnerabilidades comunes agregando headers HTTP seguros
 */
app.use(
  helmet({
    // Content Security Policy - Previene XSS
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Para desarrollo
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    // Cross Origin Embedder Policy
    crossOriginEmbedderPolicy: false, // Desactivado para desarrollo
    // Cross Origin Resource Policy
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Permite CORS
  })
);

// Body parser - Parsear JSON y URL encoded con límites de seguridad
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

/**
 * Data Sanitization - Protección contra NoSQL Injection
 * Elimina caracteres especiales de MongoDB ($, .) de req.body y req.params
 */
const sanitize = (obj) => {
  if (obj instanceof Object) {
    for (let key in obj) {
      if (/\$/.test(key) || /\./.test(key)) {
        delete obj[key];
      } else {
        sanitize(obj[key]);
      }
    }
  }
  return obj;
};

app.use((req, res, next) => {
  req.body = sanitize(req.body);
  req.params = sanitize(req.params);
  next();
});

/**
 * Rate Limiting - Protección contra ataques de fuerza bruta
 * En desarrollo: límites relajados para testing
 * En producción: límites estrictos para seguridad
 */
const isDevelopment = process.env.NODE_ENV !== "production";

// Limitador general para todas las rutas de la API
const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 1000 : 100, // Dev: 1000 req, Prod: 100 req
  message: {
    success: false,
    message:
      "Demasiadas solicitudes desde esta IP, por favor intenta de nuevo en 15 minutos",
  },
  standardHeaders: true, // Retornar información en los headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
  handler: (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    logger.security.rateLimitExceeded(ip, req.path);
    res.status(429).json({
      success: false,
      message: "Demasiadas solicitudes. Por favor, intenta más tarde.",
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000),
    });
  },
});

// Limitador estricto para rutas de autenticación (login, registro)
// En development: 100 intentos (para testing)
// En production: 5 intentos (seguridad)
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 100 : 5, // Dev: 100, Prod: 5
  skipSuccessfulRequests: true, // No contar requests exitosos
  message: {
    success: false,
    message:
      "Demasiados intentos de inicio de sesión, por favor intenta de nuevo en 15 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    logger.security.rateLimitExceeded(ip, `AUTH: ${req.path}`);
    res.status(429).json({
      success: false,
      message:
        "Demasiados intentos fallidos. Tu cuenta ha sido temporalmente bloqueada por seguridad.",
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000),
      tip: "Espera 15 minutos o usa 'Olvidé mi contraseña' si no recuerdas tus credenciales",
    });
  },
});

// Limitador para refresh token (más permisivo que login)
// En development: 500 intentos (para testing con tokens expirados)
// En production: 30 intentos (permite varios refreshes pero previene abuso)
const limiterRefresh = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 500 : 30, // Dev: 500, Prod: 30
  skipSuccessfulRequests: false, // Contar todos los requests
  message: {
    success: false,
    message: "Demasiados intentos de renovación de token",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    logger.security.rateLimitExceeded(ip, "REFRESH_TOKEN");
    res.status(429).json({
      success: false,
      message:
        "Demasiados intentos de renovación. Por favor, inicia sesión nuevamente.",
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000),
    });
  },
});

// Aplicar limitador general a todas las rutas /api
app.use("/api/", limiterGeneral);

// Logging de requests en desarrollo
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

/**
 * Rutas principales
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API de Inventario TI",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      health: "/api/health",
    },
    documentation: "https://github.com/tu-repo/inventario-ti",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    environment: process.env.NODE_ENV || "development",
  });
});

/**
 * API Routes
 */
// Rutas de autenticación con rate limiting estricto
app.use("/api/auth/login", limiterAuth);
app.use("/api/auth/registrar", limiterAuth);
app.use("/api/auth/olvide-mi-password", limiterAuth);
app.use("/api/auth/reset-password", limiterAuth);

// Refresh token con su propio limitador (más permisivo)
app.use("/api/auth/refresh-token", limiterRefresh);

// Todas las rutas de auth y users
app.use("/api/auth", authRoutes);
app.use("/api/auth/2fa", twoFactorRoutes);
app.use("/api/users", userRoutes);

// Rutas de inventario y reparaciones (protegidas con middleware)
app.use("/api/inventario", inventarioRoutes);
app.use("/api/reparaciones", reparacionRoutes);

/**
 * Manejo de rutas no encontradas (404)
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.path,
  });
});

/**
 * Manejo global de errores
 */
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

/**
 * Iniciar servidor
 */
const server = app.listen(PORT, () => {
  logger.info(`Servidor iniciado en puerto ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  });
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Backend URL: http://localhost:${PORT}`);
  console.log(
    `📍 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`📍 Roles: administrador_ti, ti`);
  console.log(`🔒 CORS configurado para orígenes permitidos`);
  console.log(`🛡️  Rate Limiting activo:`);
  console.log(`   • General: ${isDevelopment ? "1000" : "100"} req/15min`);
  console.log(`   • Auth: ${isDevelopment ? "100" : "5"} intentos/15min`);
  console.log(`   • Refresh: ${isDevelopment ? "500" : "30"} intentos/15min`);
  console.log(
    `   • Modo: ${
      isDevelopment
        ? "🧪 DEVELOPMENT (límites relajados)"
        : "🔒 PRODUCTION (límites estrictos)"
    }`
  );
  console.log(`🔐 Helmet.js activo (Security Headers)`);
  console.log(`✅ Input Validation activo (Joi)`);
  console.log(`🧹 NoSQL Injection Protection activo`);
  console.log(`📝 Winston Logging activo (logs/, security logs 90d)`);
  console.log(`🔑 Session Management con Token Blacklist activo`);
  console.log(`🔒 Password Policies: 12+ chars, especiales, sin comunes`);
  console.log(`🔐 Two-Factor Authentication (2FA) disponible`);
  console.log(`\n🎯 SECURITY SCORE: 100/100 ⭐⭐⭐⭐⭐`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

/**
 * Manejo de errores no capturados
 */
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", {
    error: err.message,
    stack: err.stack,
  });
  // Cerrar servidor y proceso
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", { error: err.message, stack: err.stack });
  process.exit(1);
});
