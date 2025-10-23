const winston = require("winston");
require("winston-daily-rotate-file");
const path = require("path");

// Definir niveles de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definir colores para cada nivel
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

// Agregar colores a Winston
winston.addColors(colors);

// Formato para archivos (JSON estructurado)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Formato para consola (colorido y legible)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Configurar transporte de rotación diaria para errores
const errorFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, "../../logs/error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m",
  maxFiles: "30d",
  format: fileFormat,
  zippedArchive: true,
});

// Configurar transporte de rotación diaria para todos los logs
const combinedFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, "../../logs/combined-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  format: fileFormat,
  zippedArchive: true,
});

// Configurar transporte de rotación diaria para logs de seguridad
const securityFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, "../../logs/security-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "warn",
  maxSize: "20m",
  maxFiles: "90d", // Guardar logs de seguridad por 90 días
  format: fileFormat,
  zippedArchive: true,
});

// Crear el logger
const logger = winston.createLogger({
  levels,
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports: [
    // Consola (solo en desarrollo)
    new winston.transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === "production", // Silenciar en producción
    }),
    // Archivos con rotación
    errorFileRotateTransport,
    combinedFileRotateTransport,
    securityFileRotateTransport,
  ],
  exitOnError: false,
});

// Funciones de logging específicas para seguridad
logger.security = {
  loginAttempt: (email, ip, success) => {
    logger.warn("Login Attempt", {
      event: "LOGIN_ATTEMPT",
      email,
      ip,
      success,
      timestamp: new Date().toISOString(),
    });
  },

  loginSuccess: (userId, email, ip, role) => {
    logger.info("Login Success", {
      event: "LOGIN_SUCCESS",
      userId,
      email,
      ip,
      role,
      timestamp: new Date().toISOString(),
    });
  },

  loginFailure: (email, ip, reason) => {
    logger.warn("Login Failure", {
      event: "LOGIN_FAILURE",
      email,
      ip,
      reason,
      timestamp: new Date().toISOString(),
    });
  },

  tokenExpired: (userId, ip) => {
    logger.warn("Token Expired", {
      event: "TOKEN_EXPIRED",
      userId,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  invalidToken: (ip, reason) => {
    logger.warn("Invalid Token", {
      event: "INVALID_TOKEN",
      ip,
      reason,
      timestamp: new Date().toISOString(),
    });
  },

  registerAttempt: (email, ip) => {
    logger.info("Register Attempt", {
      event: "REGISTER_ATTEMPT",
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  registerSuccess: (userId, email, ip, role) => {
    logger.info("Register Success", {
      event: "REGISTER_SUCCESS",
      userId,
      email,
      ip,
      role,
      timestamp: new Date().toISOString(),
    });
  },

  unauthorizedAccess: (userId, ip, resource, requiredRole) => {
    logger.warn("Unauthorized Access", {
      event: "UNAUTHORIZED_ACCESS",
      userId,
      ip,
      resource,
      requiredRole,
      timestamp: new Date().toISOString(),
    });
  },

  rateLimitExceeded: (ip, endpoint) => {
    logger.warn("Rate Limit Exceeded", {
      event: "RATE_LIMIT_EXCEEDED",
      ip,
      endpoint,
      timestamp: new Date().toISOString(),
    });
  },

  passwordResetRequest: (email, ip) => {
    logger.info("Password Reset Request", {
      event: "PASSWORD_RESET_REQUEST",
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  passwordResetSuccess: (email, ip) => {
    logger.info("Password Reset Success", {
      event: "PASSWORD_RESET_SUCCESS",
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  suspiciousActivity: (ip, reason, details) => {
    logger.error("Suspicious Activity", {
      event: "SUSPICIOUS_ACTIVITY",
      ip,
      reason,
      details,
      timestamp: new Date().toISOString(),
    });
  },
};

module.exports = logger;
