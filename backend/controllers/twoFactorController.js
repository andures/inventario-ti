const User = require("../models/User");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const logger = require("../utils/logger");
const crypto = require("crypto");

/**
 * @desc    Generar secret y QR code para habilitar 2FA
 * @route   POST /api/auth/2fa/setup
 * @access  Private
 */
const setup2FA = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;

    // Generar secret temporal
    const secret = speakeasy.generateSecret({
      name: `Inventario TI (${userEmail})`,
      issuer: "Inventario TI",
      length: 32,
    });

    // Generar QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Guardar secret temporal (aún no activado)
    const usuario = await User.findById(userId).select("+twoFactorSecret");
    usuario.twoFactorSecret = secret.base32;
    await usuario.save();

    logger.info("2FA setup initiated", {
      event: "2FA_SETUP",
      userId,
      email: userEmail,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Escanea el código QR con Google Authenticator o Authy",
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntry: secret.otpauth_url,
      },
    });
  } catch (error) {
    logger.error("Error en setup2FA:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al configurar 2FA",
      error: error.message,
    });
  }
};

/**
 * @desc    Verificar código TOTP y activar 2FA
 * @route   POST /api/auth/2fa/verify
 * @access  Private
 */
const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user._id;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporcione el código de 6 dígitos",
      });
    }

    // Obtener usuario con secret
    const usuario = await User.findById(userId).select("+twoFactorSecret");

    if (!usuario.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: "Primero debes configurar 2FA con /api/auth/2fa/setup",
      });
    }

    // Verificar el token TOTP
    const verified = speakeasy.totp.verify({
      secret: usuario.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 2, // Permitir 2 intervalos de tiempo (60 segundos antes/después)
    });

    if (!verified) {
      logger.warn("2FA verification failed", {
        event: "2FA_VERIFY_FAILED",
        userId,
        email: usuario.email,
        timestamp: new Date().toISOString(),
      });

      return res.status(401).json({
        success: false,
        message: "Código inválido. Por favor verifica e intenta de nuevo",
      });
    }

    // Generar códigos de respaldo
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString("hex").toUpperCase();
      backupCodes.push(code);
    }

    // Activar 2FA
    usuario.twoFactorEnabled = true;
    usuario.twoFactorBackupCodes = backupCodes.map((code) =>
      crypto.createHash("sha256").update(code).digest("hex")
    );
    await usuario.save();

    logger.info("2FA enabled successfully", {
      event: "2FA_ENABLED",
      userId,
      email: usuario.email,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "2FA activado exitosamente",
      data: {
        backupCodes: backupCodes,
        warning:
          "Guarda estos códigos de respaldo en un lugar seguro. Los necesitarás si pierdes acceso a tu aplicación de autenticación",
      },
    });
  } catch (error) {
    logger.error("Error en verify2FA:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al verificar 2FA",
      error: error.message,
    });
  }
};

/**
 * @desc    Desactivar 2FA
 * @route   POST /api/auth/2fa/disable
 * @access  Private
 */
const disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporcione su contraseña para desactivar 2FA",
      });
    }

    // Obtener usuario con password y 2FA data
    const usuario = await User.findById(userId).select(
      "+password +twoFactorSecret +twoFactorBackupCodes"
    );

    // Verificar contraseña
    const passwordCorrecto = await usuario.compararPassword(password);

    if (!passwordCorrecto) {
      logger.warn("2FA disable failed - wrong password", {
        event: "2FA_DISABLE_FAILED",
        userId,
        email: usuario.email,
        reason: "invalid_password",
        timestamp: new Date().toISOString(),
      });

      return res.status(401).json({
        success: false,
        message: "Contraseña incorrecta",
      });
    }

    // Desactivar 2FA
    usuario.twoFactorEnabled = false;
    usuario.twoFactorSecret = undefined;
    usuario.twoFactorBackupCodes = undefined;
    await usuario.save();

    logger.warn("2FA disabled", {
      event: "2FA_DISABLED",
      userId,
      email: usuario.email,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "2FA desactivado exitosamente",
    });
  } catch (error) {
    logger.error("Error en disable2FA:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al desactivar 2FA",
      error: error.message,
    });
  }
};

/**
 * @desc    Verificar código 2FA en el login
 * @route   POST /api/auth/2fa/validate
 * @access  Public (pero requiere credentials temporales)
 */
const validate2FALogin = async (req, res) => {
  try {
    const { email, token, useBackupCode } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporcione email y código",
      });
    }

    // Buscar usuario
    const usuario = await User.findOne({ email }).select(
      "+twoFactorSecret +twoFactorBackupCodes"
    );

    if (!usuario || !usuario.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: "Usuario no encontrado o 2FA no activado",
      });
    }

    let verified = false;

    if (useBackupCode) {
      // Verificar código de respaldo
      const hashedCode = crypto
        .createHash("sha256")
        .update(token.toUpperCase())
        .digest("hex");

      const codeIndex = usuario.twoFactorBackupCodes.indexOf(hashedCode);

      if (codeIndex !== -1) {
        // Remover código usado
        usuario.twoFactorBackupCodes.splice(codeIndex, 1);
        await usuario.save();
        verified = true;

        logger.info("2FA backup code used", {
          event: "2FA_BACKUP_CODE_USED",
          userId: usuario._id,
          email: usuario.email,
          codesRemaining: usuario.twoFactorBackupCodes.length,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Verificar TOTP normal
      verified = speakeasy.totp.verify({
        secret: usuario.twoFactorSecret,
        encoding: "base32",
        token: token,
        window: 2,
      });
    }

    if (!verified) {
      logger.warn("2FA login validation failed", {
        event: "2FA_LOGIN_FAILED",
        userId: usuario._id,
        email: usuario.email,
        useBackupCode,
        timestamp: new Date().toISOString(),
      });

      return res.status(401).json({
        success: false,
        message: "Código inválido",
      });
    }

    logger.info("2FA login validated successfully", {
      event: "2FA_LOGIN_SUCCESS",
      userId: usuario._id,
      email: usuario.email,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Código 2FA verificado exitosamente",
      data: {
        userId: usuario._id,
        verified: true,
      },
    });
  } catch (error) {
    logger.error("Error en validate2FALogin:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al validar código 2FA",
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener estado de 2FA del usuario actual
 * @route   GET /api/auth/2fa/status
 * @access  Private
 */
const get2FAStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const usuario = await User.findById(userId).select("+twoFactorBackupCodes");

    res.json({
      success: true,
      data: {
        enabled: usuario.twoFactorEnabled || false,
        backupCodesRemaining: usuario.twoFactorBackupCodes
          ? usuario.twoFactorBackupCodes.length
          : 0,
      },
    });
  } catch (error) {
    logger.error("Error en get2FAStatus:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al obtener estado de 2FA",
      error: error.message,
    });
  }
};

module.exports = {
  setup2FA,
  verify2FA,
  disable2FA,
  validate2FALogin,
  get2FAStatus,
};
