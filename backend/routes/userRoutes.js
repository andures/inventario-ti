const express = require("express");
const router = express.Router();
const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarRol,
  cambiarEstado,
  eliminarUsuario,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  actualizarRolSchema,
  cambiarEstadoSchema,
  mongoIdSchema,
} = require("../validators/userValidators");

/**
 * Todas las rutas requieren autenticación y rol de administrador_ti
 */
router.use(protect);
router.use(authorize("administrador_ti"));

/**
 * Rutas de gestión de usuarios
 */
router.get("/", obtenerUsuarios);
router.get("/:id", validate(mongoIdSchema, "params"), obtenerUsuarioPorId);
router.put(
  "/:id/rol",
  validate(mongoIdSchema, "params"),
  validate(actualizarRolSchema),
  actualizarRol
);
router.put(
  "/:id/estado",
  validate(mongoIdSchema, "params"),
  validate(cambiarEstadoSchema),
  cambiarEstado
);
router.delete("/:id", validate(mongoIdSchema, "params"), eliminarUsuario);

module.exports = router;
