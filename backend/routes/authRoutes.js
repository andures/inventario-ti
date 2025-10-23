const express = require("express");
const router = express.Router();
const {
  registrar,
  login,
  refreshToken,
  olvideMiPassword,
  resetPassword,
  logout,
  logoutAll,
  obtenerUsuarioActual,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  registrarSchema,
  loginSchema,
  olvideMiPasswordSchema,
  resetPasswordSchema,
} = require("../validators/authValidators");

/**
 * Rutas públicas de autenticación
 */
router.post("/registrar", validate(registrarSchema), registrar);
router.post("/login", validate(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.post(
  "/olvide-password",
  validate(olvideMiPasswordSchema),
  olvideMiPassword
);
router.put(
  "/reset-password/:resettoken",
  validate(resetPasswordSchema),
  resetPassword
);

/**
 * Rutas protegidas (requieren autenticación)
 */
router.get("/me", protect, obtenerUsuarioActual);
router.post("/logout", protect, logout);
router.post("/logout-all", protect, logoutAll);

module.exports = router;
