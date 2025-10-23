const User = require("../models/User");
const RevokedToken = require("../models/RevokedToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const logger = require("../utils/logger");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwtUtils");

/**
 * @desc    Registrar nuevo usuario
 * @route   POST /api/auth/registrar
 * @access  Public
 */
exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    // Log intento de registro
    logger.security.registerAttempt(email, ip);

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporcione nombre, email y contraseña",
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExiste = await User.findOne({ email });

    if (usuarioExiste) {
      logger.warn("Register failed - email already exists", { email, ip });
      return res.status(409).json({
        success: false,
        message: "El email ya está registrado",
      });
    }

    // Validar rol si se proporciona
    const rolesPermitidos = ["administrador_ti", "ti"];
    if (rol && !rolesPermitidos.includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol no válido. Debe ser "administrador_ti" o "ti"',
      });
    }

    // Crear usuario
    const usuario = await User.create({
      nombre,
      email,
      password,
      rol: rol || "ti",
    });

    // Generar tokens
    const accessToken = generateAccessToken(usuario._id);
    const refreshToken = generateRefreshToken(usuario._id);

    // Guardar refresh token en la BD
    usuario.refreshToken = refreshToken;
    await usuario.save();

    // Log registro exitoso
    logger.security.registerSuccess(usuario._id, email, ip, usuario.rol);

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: {
        user: usuario.obtenerDatosPublicos(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error("Error en registrar:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};

/**
 * @desc    Iniciar sesión
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password, twoFactorToken } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    // Log intento de login
    logger.security.loginAttempt(email, ip, false);

    // Validar email y password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporcione email y contraseña",
      });
    }

    // Buscar usuario y incluir password y 2FA data
    const usuario = await User.findOne({ email }).select(
      "+password +twoFactorSecret +twoFactorEnabled"
    );

    if (!usuario) {
      logger.security.loginFailure(email, ip, "Usuario no encontrado");
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // DEBUG: Log 2FA status
    logger.info("Login - 2FA Status Check", {
      email: usuario.email,
      twoFactorEnabled: usuario.twoFactorEnabled,
      hasTwoFactorSecret: !!usuario.twoFactorSecret,
      twoFactorTokenProvided: !!twoFactorToken,
    });

    // Verificar contraseña
    const passwordCorrecto = await usuario.compararPassword(password);

    if (!passwordCorrecto) {
      logger.security.loginFailure(email, ip, "Contraseña incorrecta");
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      logger.security.loginFailure(email, ip, "Usuario inactivo");
      return res.status(401).json({
        success: false,
        message: "Usuario inactivo. Contacte al administrador.",
      });
    }

    // Si el usuario tiene 2FA activado
    if (usuario.twoFactorEnabled) {
      // Si no se proporcionó el token 2FA, solicitar
      if (!twoFactorToken) {
        return res.status(206).json({
          success: false,
          message: "Se requiere código de autenticación de dos factores",
          requires2FA: true,
          tempAuth: {
            email: usuario.email,
            userId: usuario._id,
          },
        });
      }

      // Verificar el token 2FA
      const speakeasy = require("speakeasy");
      const verified = speakeasy.totp.verify({
        secret: usuario.twoFactorSecret,
        encoding: "base32",
        token: twoFactorToken,
        window: 2,
      });

      if (!verified) {
        logger.security.loginFailure(email, ip, "2FA token inválido");
        return res.status(401).json({
          success: false,
          message: "Código de autenticación inválido",
        });
      }

      logger.info("2FA verified during login", {
        event: "2FA_LOGIN_VERIFIED",
        userId: usuario._id,
        email,
        ip,
        timestamp: new Date().toISOString(),
      });
    }

    // Generar tokens
    const accessToken = generateAccessToken(usuario._id);
    const refreshToken = generateRefreshToken(usuario._id);

    // Guardar refresh token
    usuario.refreshToken = refreshToken;
    await usuario.save();

    // Log login exitoso
    logger.security.loginSuccess(usuario._id, email, ip, usuario.rol);

    res.json({
      success: true,
      message: "Login exitoso",
      data: {
        user: usuario.obtenerDatosPublicos(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error("Error en login:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
};

/**
 * @desc    Renovar access token usando refresh token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token no proporcionado",
      });
    }

    // Verificar refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Refresh token inválido o expirado",
      });
    }

    // Buscar usuario
    const usuario = await User.findById(decoded.id);

    if (!usuario || usuario.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token inválido",
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: "Usuario inactivo",
      });
    }

    // Generar nuevos tokens
    const nuevoAccessToken = generateAccessToken(usuario._id);
    const nuevoRefreshToken = generateRefreshToken(usuario._id);

    // Actualizar refresh token
    usuario.refreshToken = nuevoRefreshToken;
    await usuario.save();

    res.json({
      success: true,
      message: "Tokens renovados exitosamente",
      data: {
        accessToken: nuevoAccessToken,
        refreshToken: nuevoRefreshToken,
      },
    });
  } catch (error) {
    console.error("Error en refreshToken:", error);
    res.status(500).json({
      success: false,
      message: "Error al renovar token",
      error: error.message,
    });
  }
};

/**
 * @desc    Solicitar recuperación de contraseña
 * @route   POST /api/auth/olvide-password
 * @access  Public
 */
exports.olvideMiPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporcione un email",
      });
    }

    const usuario = await User.findOne({ email });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "No existe usuario con ese email",
      });
    }

    // Generar token de reseteo
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token y guardar en BD
    usuario.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Establecer expiración (10 minutos)
    usuario.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await usuario.save();

    // Crear URL de reseteo
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/reset-password/${resetToken}`;

    const message = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recuperación de Contraseña</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${usuario.nombre}</strong>,</p>
            <p>Has solicitado recuperar tu contraseña para el sistema de Inventario TI.</p>
            <p>Por favor haz clic en el siguiente botón para resetear tu contraseña:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Resetear Contraseña</a>
            </p>
            <p>O copia y pega esta URL en tu navegador:</p>
            <p style="word-break: break-all; background-color: #e9e9e9; padding: 10px;">${resetUrl}</p>
            <p><strong>⚠️ Este enlace expira en 10 minutos.</strong></p>
            <p>Si no solicitaste esto, por favor ignora este email y tu contraseña permanecerá sin cambios.</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas.</p>
            <p>&copy; ${new Date().getFullYear()} Inventario TI. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        email: usuario.email,
        subject: "Recuperación de Contraseña - Inventario TI",
        message,
      });

      res.json({
        success: true,
        message: "Email de recuperación enviado correctamente",
      });
    } catch (error) {
      console.error("Error enviando email:", error);

      // Revertir cambios si falla el envío
      usuario.resetPasswordToken = undefined;
      usuario.resetPasswordExpire = undefined;
      await usuario.save();

      return res.status(500).json({
        success: false,
        message: "No se pudo enviar el email. Intente de nuevo más tarde.",
      });
    }
  } catch (error) {
    console.error("Error en olvideMiPassword:", error);
    res.status(500).json({
      success: false,
      message: "Error en recuperación de contraseña",
      error: error.message,
    });
  }
};

/**
 * @desc    Resetear contraseña
 * @route   PUT /api/auth/reset-password/:resettoken
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporcione una contraseña",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Obtener token hasheado
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const usuario = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: "Token inválido o expirado",
      });
    }

    // Establecer nueva contraseña
    usuario.password = password;
    usuario.resetPasswordToken = undefined;
    usuario.resetPasswordExpire = undefined;
    usuario.refreshToken = undefined; // Invalidar refresh token actual
    await usuario.save();

    res.json({
      success: true,
      message:
        "Contraseña actualizada exitosamente. Por favor inicia sesión con tu nueva contraseña.",
    });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({
      success: false,
      message: "Error al resetear contraseña",
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener usuario actual
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.obtenerUsuarioActual = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);

    res.json({
      success: true,
      data: usuario.obtenerDatosPublicos(),
    });
  } catch (error) {
    logger.error("Error en obtenerUsuarioActual:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
};

/**
 * @desc    Cerrar sesión (logout)
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const token = req.token; // Viene del middleware protect
    const userId = req.user._id;

    // Calcular fecha de expiración del access token (15 minutos)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Revocar el access token
    await RevokedToken.revokeToken(
      token,
      userId,
      "access",
      expiresAt,
      ip,
      "logout"
    );

    // Limpiar el refresh token del usuario
    const usuario = await User.findById(userId);
    if (usuario && usuario.refreshToken) {
      // Revocar también el refresh token
      const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await RevokedToken.revokeToken(
        usuario.refreshToken,
        userId,
        "refresh",
        refreshExpiresAt,
        ip,
        "logout"
      );

      usuario.refreshToken = null;
      await usuario.save();
    }

    logger.info("Logout successful", {
      event: "LOGOUT",
      userId,
      email: req.user.email,
      ip,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Sesión cerrada exitosamente",
    });
  } catch (error) {
    logger.error("Error en logout:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al cerrar sesión",
      error: error.message,
    });
  }
};

/**
 * @desc    Cerrar todas las sesiones (revocar todos los tokens)
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
exports.logoutAll = async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userId = req.user._id;
    const currentToken = req.token; // Token actual usado en esta request

    // 1. Revocar el access token actual
    const accessExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await RevokedToken.revokeToken(
      currentToken,
      userId,
      "access",
      accessExpiresAt,
      ip,
      "security"
    );

    // 2. Revocar el refresh token almacenado
    const usuario = await User.findById(userId);
    if (usuario && usuario.refreshToken) {
      const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await RevokedToken.revokeToken(
        usuario.refreshToken,
        userId,
        "refresh",
        refreshExpiresAt,
        ip,
        "security"
      );

      usuario.refreshToken = null;
      await usuario.save();
    }

    logger.warn("Logout all sessions", {
      event: "LOGOUT_ALL",
      userId,
      email: req.user.email,
      ip,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Todas las sesiones han sido cerradas",
    });
  } catch (error) {
    logger.error("Error en logoutAll:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al cerrar todas las sesiones",
      error: error.message,
    });
  }
};
