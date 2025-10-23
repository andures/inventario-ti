const mongoose = require("mongoose");

/**
 * Schema de Ticket de Reparación
 * Define la estructura de los tickets de reparación en la base de datos
 */
const reparacionSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es requerido"],
      trim: true,
      maxlength: [200, "El título no puede exceder 200 caracteres"],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [1000, "La descripción no puede exceder 1000 caracteres"],
    },
    dispositivo: {
      type: String,
      required: [true, "El dispositivo es requerido"],
      trim: true,
      maxlength: [
        200,
        "El nombre del dispositivo no puede exceder 200 caracteres",
      ],
    },
    serie: {
      type: String,
      trim: true,
      maxlength: [100, "El número de serie no puede exceder 100 caracteres"],
    },
    cliente: {
      type: String,
      required: [true, "El cliente es requerido"],
      trim: true,
      maxlength: [200, "El nombre del cliente no puede exceder 200 caracteres"],
    },
    prioridad: {
      type: String,
      enum: {
        values: ["baja", "media", "alta"],
        message: 'La prioridad debe ser "baja", "media" o "alta"',
      },
      default: "media",
    },
    estado: {
      type: String,
      enum: {
        values: ["pendiente", "proceso", "finalizado"],
        message: 'El estado debe ser "pendiente", "proceso" o "finalizado"',
      },
      default: "pendiente",
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    fechaEntrega: {
      type: Date,
    },
    fechaFinalizacion: {
      type: Date,
    },
    inventarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventario",
    },
    asignadoA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    notas: {
      type: String,
      maxlength: [2000, "Las notas no pueden exceder 2000 caracteres"],
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

/**
 * Índices para mejorar búsquedas
 */
reparacionSchema.index({ estado: 1, fechaCreacion: -1 });
reparacionSchema.index({ cliente: 1 });
reparacionSchema.index({ dispositivo: 1 });
reparacionSchema.index({ asignadoA: 1 });

/**
 * Middleware: Actualizar fecha de finalización cuando el estado cambia a finalizado
 */
reparacionSchema.pre("save", function (next) {
  if (
    this.isModified("estado") &&
    this.estado === "finalizado" &&
    !this.fechaFinalizacion
  ) {
    this.fechaFinalizacion = new Date();
  }
  next();
});

module.exports = mongoose.model("Reparacion", reparacionSchema);
