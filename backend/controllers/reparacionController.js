const Reparacion = require("../models/Reparacion");
const Inventario = require("../models/Inventario");
const logger = require("../utils/logger");

/**
 * @desc    Listar todos los tickets de reparación
 * @route   GET /api/reparaciones
 * @access  Private
 */
exports.listarReparaciones = async (req, res) => {
  try {
    const { estado, prioridad, cliente, asignadoA, search } = req.query;
    const filter = {};

    // Filtros
    if (estado && ["pendiente", "proceso", "finalizado"].includes(estado)) {
      filter.estado = estado;
    }

    if (prioridad && ["baja", "media", "alta"].includes(prioridad)) {
      filter.prioridad = prioridad;
    }

    if (cliente) {
      filter.cliente = { $regex: cliente, $options: "i" };
    }

    if (asignadoA) {
      filter.asignadoA = asignadoA;
    }

    // Búsqueda general
    if (search) {
      filter.$or = [
        { titulo: { $regex: search, $options: "i" } },
        { dispositivo: { $regex: search, $options: "i" } },
        { serie: { $regex: search, $options: "i" } },
        { cliente: { $regex: search, $options: "i" } },
      ];
    }

    const tickets = await Reparacion.find(filter)
      .sort({ fechaCreacion: -1 })
      .populate("creadoPor", "nombre email")
      .populate("actualizadoPor", "nombre email")
      .populate("asignadoA", "nombre email")
      .populate("inventarioId", "nombre categoria serie");

    res.json({
      success: true,
      data: tickets,
      count: tickets.length,
    });
  } catch (error) {
    logger.error("Error en listarReparaciones:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al obtener las reparaciones",
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener un ticket de reparación por ID
 * @route   GET /api/reparaciones/:id
 * @access  Private
 */
exports.obtenerReparacion = async (req, res) => {
  try {
    const ticket = await Reparacion.findById(req.params.id)
      .populate("creadoPor", "nombre email")
      .populate("actualizadoPor", "nombre email")
      .populate("asignadoA", "nombre email")
      .populate("inventarioId", "nombre categoria serie");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
    }

    res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    logger.error("Error en obtenerReparacion:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al obtener el ticket",
      error: error.message,
    });
  }
};

/**
 * @desc    Crear nuevo ticket de reparación
 * @route   POST /api/reparaciones
 * @access  Private
 */
exports.crearReparacion = async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      creadoPor: req.user.id,
    };

    // Si se proporciona inventarioId, verificar que existe
    if (ticketData.inventarioId) {
      const inventarioItem = await Inventario.findById(ticketData.inventarioId);
      if (!inventarioItem) {
        return res.status(404).json({
          success: false,
          message: "Item de inventario no encontrado",
        });
      }

      // Actualizar estado del inventario a "en_reparacion"
      inventarioItem.estado = "en_reparacion";
      inventarioItem.actualizadoPor = req.user.id;
      await inventarioItem.save();
    }

    const ticket = await Reparacion.create(ticketData);

    logger.info("Ticket de reparación creado", {
      ticketId: ticket._id,
      cliente: ticket.cliente,
      dispositivo: ticket.dispositivo,
      creadoPor: req.user.email,
    });

    // Poblar relaciones antes de enviar respuesta
    await ticket.populate("inventarioId", "nombre categoria serie");

    res.status(201).json({
      success: true,
      message: "Ticket creado exitosamente",
      data: ticket,
    });
  } catch (error) {
    logger.error("Error en crearReparacion:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al crear el ticket",
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar ticket de reparación
 * @route   PUT /api/reparaciones/:id
 * @access  Private
 */
exports.actualizarReparacion = async (req, res) => {
  try {
    const ticket = await Reparacion.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
    }

    // Actualizar campos
    const camposActualizables = [
      "titulo",
      "descripcion",
      "dispositivo",
      "serie",
      "cliente",
      "prioridad",
      "estado",
      "fechaEntrega",
      "asignadoA",
      "notas",
    ];

    const estadoAnterior = ticket.estado;

    camposActualizables.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        ticket[campo] = req.body[campo];
      }
    });

    // Si el estado cambió a finalizado, actualizar inventario
    if (
      req.body.estado === "finalizado" &&
      estadoAnterior !== "finalizado" &&
      ticket.inventarioId
    ) {
      const inventarioItem = await Inventario.findById(ticket.inventarioId);
      if (inventarioItem && inventarioItem.estado === "en_reparacion") {
        inventarioItem.estado = "almacen";
        inventarioItem.actualizadoPor = req.user.id;
        await inventarioItem.save();
      }
    }

    ticket.actualizadoPor = req.user.id;
    await ticket.save();

    logger.info("Ticket de reparación actualizado", {
      ticketId: ticket._id,
      cliente: ticket.cliente,
      estadoAnterior,
      estadoNuevo: ticket.estado,
      actualizadoPor: req.user.email,
    });

    // Poblar relaciones antes de enviar respuesta
    await ticket.populate([
      { path: "asignadoA", select: "nombre email" },
      { path: "inventarioId", select: "nombre categoria serie" },
    ]);

    res.json({
      success: true,
      message: "Ticket actualizado exitosamente",
      data: ticket,
    });
  } catch (error) {
    logger.error("Error en actualizarReparacion:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al actualizar el ticket",
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar ticket de reparación
 * @route   DELETE /api/reparaciones/:id
 * @access  Private (solo administrador_ti)
 */
exports.eliminarReparacion = async (req, res) => {
  try {
    const ticket = await Reparacion.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket no encontrado",
      });
    }

    // Solo administradores pueden eliminar
    if (req.user.rol !== "administrador_ti") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar tickets",
      });
    }

    await ticket.deleteOne();

    logger.warn("Ticket de reparación eliminado", {
      ticketId: ticket._id,
      cliente: ticket.cliente,
      eliminadoPor: req.user.email,
    });

    res.json({
      success: true,
      message: "Ticket eliminado exitosamente",
    });
  } catch (error) {
    logger.error("Error en eliminarReparacion:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Error al eliminar el ticket",
      error: error.message,
    });
  }
};
