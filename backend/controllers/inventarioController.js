const Inventario = require("../models/Inventario");
const logger = require("../utils/logger");

/**
 * @desc    Listar todos los items del inventario
 * @route   GET /api/inventario
 * @access  Private
 */
exports.listarInventario = async (req, res) => {
  try {
    const { estado, cliente, search } = req.query;
    const filter = {};

    // Filtrar por estado si se proporciona
    if (estado && ["almacen", "en_reparacion", "entregado"].includes(estado)) {
      filter.estado = estado;
    }

    // Filtrar por cliente si se proporciona
    if (cliente) {
      filter.cliente = { $regex: cliente, $options: "i" };
    }

    // Búsqueda general
    if (search) {
      filter.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { categoria: { $regex: search, $options: "i" } },
        { serie: { $regex: search, $options: "i" } },
        { cliente: { $regex: search, $options: "i" } },
      ];
    }

    const items = await Inventario.find(filter)
      .sort({ createdAt: -1 })
      .populate("creadoPor", "nombre email")
      .populate("actualizadoPor", "nombre email");

    res.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error) {
    logger.error("Error en listarInventario:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al obtener el inventario",
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener un item del inventario por ID
 * @route   GET /api/inventario/:id
 * @access  Private
 */
exports.obtenerItem = async (req, res) => {
  try {
    const item = await Inventario.findById(req.params.id)
      .populate("creadoPor", "nombre email")
      .populate("actualizadoPor", "nombre email");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item no encontrado",
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    logger.error("Error en obtenerItem:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al obtener el item",
      error: error.message,
    });
  }
};

/**
 * @desc    Crear nuevo item de inventario
 * @route   POST /api/inventario
 * @access  Private
 */
exports.crearItem = async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      creadoPor: req.user.id,
    };

    const item = await Inventario.create(itemData);

    logger.info("Item de inventario creado", {
      itemId: item._id,
      nombre: item.nombre,
      creadoPor: req.user.email,
    });

    res.status(201).json({
      success: true,
      message: "Item creado exitosamente",
      data: item,
    });
  } catch (error) {
    logger.error("Error en crearItem:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al crear el item",
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar item de inventario
 * @route   PUT /api/inventario/:id
 * @access  Private
 */
exports.actualizarItem = async (req, res) => {
  try {
    const item = await Inventario.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item no encontrado",
      });
    }

    // Actualizar campos
    const camposActualizables = [
      "nombre",
      "categoria",
      "serie",
      "estado",
      "cliente",
      "notas",
    ];

    camposActualizables.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        item[campo] = req.body[campo];
      }
    });

    item.actualizadoPor = req.user.id;
    await item.save();

    logger.info("Item de inventario actualizado", {
      itemId: item._id,
      nombre: item.nombre,
      actualizadoPor: req.user.email,
    });

    res.json({
      success: true,
      message: "Item actualizado exitosamente",
      data: item,
    });
  } catch (error) {
    logger.error("Error en actualizarItem:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al actualizar el item",
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar item de inventario
 * @route   DELETE /api/inventario/:id
 * @access  Private (solo administrador_ti)
 */
exports.eliminarItem = async (req, res) => {
  try {
    const item = await Inventario.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item no encontrado",
      });
    }

    // Solo administradores pueden eliminar
    if (req.user.rol !== "administrador_ti") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar items",
      });
    }

    await item.deleteOne();

    logger.warn("Item de inventario eliminado", {
      itemId: item._id,
      nombre: item.nombre,
      eliminadoPor: req.user.email,
    });

    res.json({
      success: true,
      message: "Item eliminado exitosamente",
    });
  } catch (error) {
    logger.error("Error en eliminarItem:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al eliminar el item",
      error: error.message,
    });
  }
};
