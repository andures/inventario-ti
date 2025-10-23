const Joi = require("joi");

/**
 * Schema para crear ticket de reparación
 */
const crearReparacionSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(200).required().messages({
    "string.empty": "El título es obligatorio",
    "string.min": "El título debe tener al menos 1 caracter",
    "string.max": "El título no puede exceder 200 caracteres",
    "any.required": "El título es obligatorio",
  }),

  descripcion: Joi.string().trim().max(1000).allow("").optional().messages({
    "string.max": "La descripción no puede exceder 1000 caracteres",
  }),

  dispositivo: Joi.string().trim().min(1).max(200).required().messages({
    "string.empty": "El dispositivo es obligatorio",
    "string.min": "El dispositivo debe tener al menos 1 caracter",
    "string.max": "El dispositivo no puede exceder 200 caracteres",
    "any.required": "El dispositivo es obligatorio",
  }),

  serie: Joi.string().trim().max(100).allow("").optional().messages({
    "string.max": "El número de serie no puede exceder 100 caracteres",
  }),

  cliente: Joi.string().trim().min(1).max(200).required().messages({
    "string.empty": "El cliente es obligatorio",
    "string.min": "El cliente debe tener al menos 1 caracter",
    "string.max": "El cliente no puede exceder 200 caracteres",
    "any.required": "El cliente es obligatorio",
  }),

  prioridad: Joi.string()
    .valid("baja", "media", "alta")
    .default("media")
    .messages({
      "any.only": 'La prioridad debe ser "baja", "media" o "alta"',
    }),

  estado: Joi.string()
    .valid("pendiente", "proceso", "finalizado")
    .default("pendiente")
    .messages({
      "any.only": 'El estado debe ser "pendiente", "proceso" o "finalizado"',
    }),

  fechaEntrega: Joi.date().optional().allow(null).messages({
    "date.base": "Fecha de entrega inválida",
  }),

  inventarioId: Joi.string().hex().length(24).optional().messages({
    "string.hex": "ID de inventario inválido",
    "string.length": "ID de inventario inválido",
  }),

  asignadoA: Joi.string().hex().length(24).optional().messages({
    "string.hex": "ID de usuario inválido",
    "string.length": "ID de usuario inválido",
  }),

  notas: Joi.string().trim().max(2000).allow("").optional().messages({
    "string.max": "Las notas no pueden exceder 2000 caracteres",
  }),
});

/**
 * Schema para actualizar ticket de reparación
 */
const actualizarReparacionSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(200).optional().messages({
    "string.empty": "El título no puede estar vacío",
    "string.min": "El título debe tener al menos 1 caracter",
    "string.max": "El título no puede exceder 200 caracteres",
  }),

  descripcion: Joi.string().trim().max(1000).allow("").optional().messages({
    "string.max": "La descripción no puede exceder 1000 caracteres",
  }),

  dispositivo: Joi.string().trim().min(1).max(200).optional().messages({
    "string.empty": "El dispositivo no puede estar vacío",
    "string.min": "El dispositivo debe tener al menos 1 caracter",
    "string.max": "El dispositivo no puede exceder 200 caracteres",
  }),

  serie: Joi.string().trim().max(100).allow("").optional().messages({
    "string.max": "El número de serie no puede exceder 100 caracteres",
  }),

  cliente: Joi.string().trim().min(1).max(200).optional().messages({
    "string.empty": "El cliente no puede estar vacío",
    "string.min": "El cliente debe tener al menos 1 caracter",
    "string.max": "El cliente no puede exceder 200 caracteres",
  }),

  prioridad: Joi.string().valid("baja", "media", "alta").optional().messages({
    "any.only": 'La prioridad debe ser "baja", "media" o "alta"',
  }),

  estado: Joi.string()
    .valid("pendiente", "proceso", "finalizado")
    .optional()
    .messages({
      "any.only": 'El estado debe ser "pendiente", "proceso" o "finalizado"',
    }),

  fechaEntrega: Joi.date().optional().allow(null).messages({
    "date.base": "Fecha de entrega inválida",
  }),

  asignadoA: Joi.string().hex().length(24).optional().allow(null).messages({
    "string.hex": "ID de usuario inválido",
    "string.length": "ID de usuario inválido",
  }),

  notas: Joi.string().trim().max(2000).allow("").optional().messages({
    "string.max": "Las notas no pueden exceder 2000 caracteres",
  }),
}).min(1); // Al menos un campo debe ser actualizado

module.exports = {
  crearReparacionSchema,
  actualizarReparacionSchema,
};
