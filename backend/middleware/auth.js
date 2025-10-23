const User = require("../models/User");
const RevokedToken = require("../models/RevokedToken");
const logger = require("../utils/logger");
const { verifyAccessToken } = require("../utils/jwtUtils");

/**
 * Middleware: Proteger rutas (verificar autenticación)
 * Verifica el token JWT y agrega el usuario a req.user
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    const ip = req.ip || req.connection.remoteAddress;

    // Verificar si el token existe en los headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Verificar que el token existe
    if (!token) {
      logger.security.invalidToken(ip, "Token no proporcionado");
      return res.status(401).json({
        success: false,
        message:
          "No autorizado para acceder a esta ruta. Token no proporcionado.",
      });
    }

    try {
      // Verificar token
      const decoded = verifyAccessToken(token);

      if (!decoded) {
        logger.security.invalidToken(ip, "Token inválido o expirado");
        return res.status(401).json({
          success: false,
          message: "Token no válido o expirado",
        });
      }

      // Verificar si el token está en la blacklist
      const isRevoked = await RevokedToken.isRevoked(token);
      if (isRevoked) {
        logger.security.invalidToken(ip, "Token revocado (blacklist)");
        return res.status(401).json({
          success: false,
          message: "Token revocado. Por favor, inicia sesión nuevamente.",
        });
      }

      // Buscar usuario
      const user = await User.findById(decoded.id);

      if (!user) {
        logger.security.invalidToken(ip, "Usuario no encontrado");
        return res.status(401).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      // Verificar si el usuario está activo
      if (!user.activo) {
        logger.security.loginFailure(user.email, ip, "Usuario inactivo");
        return res.status(401).json({
          success: false,
          message: "Usuario inactivo. Contacte al administrador.",
        });
      }

      // Agregar usuario y token al request
      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        logger.security.tokenExpired(decoded?.id, ip);
      } else {
        logger.security.invalidToken(ip, error.message);
      }
      return res.status(401).json({
        success: false,
        message: "Token no válido",
      });
    }
  } catch (error) {
    logger.error("Error en middleware protect:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error en la autenticación",
      error: error.message,
    });
  }
};

/**
 * Middleware: Autorizar roles específicos
 * @param  {...string} roles - Roles permitidos
 * @returns {Function} - Middleware function
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;

    if (!req.user) {
      logger.security.unauthorizedAccess(
        null,
        ip,
        req.originalUrl,
        roles.join(",")
      );
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    if (!roles.includes(req.user.rol)) {
      logger.security.unauthorizedAccess(
        req.user._id,
        ip,
        req.originalUrl,
        roles.join(",")
      );
      return res.status(403).json({
        success: false,
        message: `El rol "${
          req.user.rol
        }" no está autorizado para acceder a esta ruta. Se requiere: ${roles.join(
          " o "
        )}`,
      });
    }

    next();
  };
};
