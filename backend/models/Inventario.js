const mongoose = require("mongoose");

/**
 * Schema de Item de Inventario
 * Define la estructura de los items de inventario en la base de datos
 */
const inventarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del item es requerido"],
      trim: true,
      maxlength: [200, "El nombre no puede exceder 200 caracteres"],
    },
    categoria: {
      type: String,
      trim: true,
      maxlength: [100, "La categoría no puede exceder 100 caracteres"],
    },
    serie: {
      type: String,
      trim: true,
      maxlength: [100, "El número de serie no puede exceder 100 caracteres"],
    },
    estado: {
      type: String,
      enum: {
        values: ["almacen", "en_reparacion", "entregado", "prestado"],
        message:
          'El estado debe ser "almacen", "en_reparacion", "entregado" o "prestado"',
      },
      default: "almacen",
    },
    // Información de préstamo
    prestadoA: {
      type: String,
      trim: true,
      maxlength: [
        200,
        "El nombre de la persona no puede exceder 200 caracteres",
      ],
    },
    fechaPrestamo: {
      type: Date,
    },
    fechaDevolucionEstimada: {
      type: Date,
    },
    cliente: {
      type: String,
      trim: true,
      maxlength: [200, "El nombre del cliente no puede exceder 200 caracteres"],
    },
    fechaIngreso: {
      type: Date,
      default: Date.now,
    },
    notas: {
      type: String,
      maxlength: [1000, "Las notas no pueden exceder 1000 caracteres"],
    },
    imagen: {
      type: String, // URL de la imagen (puede ser base64 o URL de servicio)
      maxlength: [500000, "La imagen es demasiado grande"], // ~500KB en base64
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actualizadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

/**
 * Índices para mejorar búsquedas
 */
inventarioSchema.index({ nombre: 1, serie: 1 });
inventarioSchema.index({ estado: 1 });
inventarioSchema.index({ cliente: 1 });

module.exports = mongoose.model("Inventario", inventarioSchema);
