const jwt = require("jsonwebtoken");

/**
 * Generar Access Token
 * @param {string} id - ID del usuario
 * @returns {string} - JWT Access Token
 */
exports.generateAccessToken = (id) => {
  if (!id) {
    throw new Error("ID de usuario requerido para generar token");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET no configurado en variables de entorno");
  }

  return jwt.sign(
    {
      id,
      type: "access",
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "15m",
      issuer: "inventario-ti-api",
      audience: "inventario-ti-client",
    }
  );
};

/**
 * Generar Refresh Token
 * @param {string} id - ID del usuario
 * @returns {string} - JWT Refresh Token
 */
exports.generateRefreshToken = (id) => {
  if (!id) {
    throw new Error("ID de usuario requerido para generar refresh token");
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error(
      "JWT_REFRESH_SECRET no configurado en variables de entorno"
    );
  }

  return jwt.sign(
    {
      id,
      type: "refresh",
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
      issuer: "inventario-ti-api",
      audience: "inventario-ti-client",
    }
  );
};

/**
 * Verificar Access Token
 * @param {string} token - JWT Access Token
 * @returns {Object|null} - Payload del token o null si es inválido
 */
exports.verifyAccessToken = (token) => {
  try {
    if (!token || typeof token !== "string") {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "inventario-ti-api",
      audience: "inventario-ti-client",
    });

    // Verificar que el token sea de tipo access
    if (decoded.type !== "access") {
      console.warn("⚠️  Token de tipo incorrecto usado como access token");
      return null;
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.warn("⚠️  Access token expirado");
    } else if (error.name === "JsonWebTokenError") {
      console.warn("⚠️  Access token inválido:", error.message);
    }
    return null;
  }
};

/**
 * Verificar Refresh Token
 * @param {string} token - JWT Refresh Token
 * @returns {Object|null} - Payload del token o null si es inválido
 */
exports.verifyRefreshToken = (token) => {
  try {
    if (!token || typeof token !== "string") {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: "inventario-ti-api",
      audience: "inventario-ti-client",
    });

    // Verificar que el token sea de tipo refresh
    if (decoded.type !== "refresh") {
      console.warn("⚠️  Token de tipo incorrecto usado como refresh token");
      return null;
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.warn("⚠️  Refresh token expirado");
    } else if (error.name === "JsonWebTokenError") {
      console.warn("⚠️  Refresh token inválido:", error.message);
    }
    return null;
  }
};
