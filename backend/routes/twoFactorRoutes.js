const express = require("express");
const router = express.Router();
const {
  setup2FA,
  verify2FA,
  disable2FA,
  validate2FALogin,
  get2FAStatus,
} = require("../controllers/twoFactorController");
const { protect } = require("../middleware/auth");

/**
 * Rutas de Two-Factor Authentication
 */

// Obtener estado de 2FA
router.get("/status", protect, get2FAStatus);

// Iniciar configuración de 2FA (generar QR)
router.post("/setup", protect, setup2FA);

// Verificar y activar 2FA
router.post("/verify", protect, verify2FA);

// Desactivar 2FA
router.post("/disable", protect, disable2FA);

// Validar código 2FA en login (pública, pero requiere email)
router.post("/validate", validate2FALogin);

module.exports = router;
