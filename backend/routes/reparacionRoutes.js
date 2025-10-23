const express = require("express");
const router = express.Router();
const {
  listarReparaciones,
  obtenerReparacion,
  crearReparacion,
  actualizarReparacion,
  eliminarReparacion,
} = require("../controllers/reparacionController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  crearReparacionSchema,
  actualizarReparacionSchema,
} = require("../validators/reparacionValidators");

/**
 * Todas las rutas requieren autenticación
 */

// GET /api/reparaciones - Listar tickets
// POST /api/reparaciones - Crear ticket
router
  .route("/")
  .get(protect, listarReparaciones)
  .post(protect, validate(crearReparacionSchema), crearReparacion);

// GET /api/reparaciones/:id - Obtener ticket
// PUT /api/reparaciones/:id - Actualizar ticket
// DELETE /api/reparaciones/:id - Eliminar ticket (solo admin)
router
  .route("/:id")
  .get(protect, obtenerReparacion)
  .put(protect, validate(actualizarReparacionSchema), actualizarReparacion)
  .delete(protect, eliminarReparacion);

module.exports = router;
