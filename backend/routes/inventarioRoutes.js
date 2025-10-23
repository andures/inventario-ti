const express = require("express");
const router = express.Router();
const {
  listarInventario,
  obtenerItem,
  crearItem,
  actualizarItem,
  eliminarItem,
} = require("../controllers/inventarioController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  crearInventarioSchema,
  actualizarInventarioSchema,
} = require("../validators/inventarioValidators");

/**
 * Todas las rutas requieren autenticación
 */

// GET /api/inventario - Listar items
// POST /api/inventario - Crear item
router
  .route("/")
  .get(protect, listarInventario)
  .post(protect, validate(crearInventarioSchema), crearItem);

// GET /api/inventario/:id - Obtener item
// PUT /api/inventario/:id - Actualizar item
// DELETE /api/inventario/:id - Eliminar item (solo admin)
router
  .route("/:id")
  .get(protect, obtenerItem)
  .put(protect, validate(actualizarInventarioSchema), actualizarItem)
  .delete(protect, eliminarItem);

module.exports = router;
