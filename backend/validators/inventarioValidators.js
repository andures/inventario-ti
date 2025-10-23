const Joi = require("joi");

/**
 * Schema para crear item de inventario
 */
const crearInventarioSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(200).required().messages({
    "string.empty": "El nombre es obligatorio",
    "string.min": "El nombre debe tener al menos 1 caracter",
    "string.max": "El nombre no puede exceder 200 caracteres",
    "any.required": "El nombre es obligatorio",
  }),

  categoria: Joi.string().trim().max(100).allow("").optional().messages({
    "string.max": "La categoría no puede exceder 100 caracteres",
  }),

  serie: Joi.string().trim().max(100).allow("").optional().messages({
    "string.max": "El número de serie no puede exceder 100 caracteres",
  }),

  estado: Joi.string()
    .valid("almacen", "en_reparacion", "entregado", "prestado")
    .default("almacen")
    .messages({
      "any.only":
        'El estado debe ser "almacen", "en_reparacion", "entregado" o "prestado"',
    }),

  prestadoA: Joi.string().trim().max(200).allow("").optional().messages({
    "string.max": "El nombre de la persona no puede exceder 200 caracteres",
  }),

  fechaPrestamo: Joi.date().optional(),

  fechaDevolucionEstimada: Joi.date().optional(),

  cliente: Joi.string().trim().max(200).allow("").optional().messages({
    "string.max": "El nombre del cliente no puede exceder 200 caracteres",
  }),

  notas: Joi.string().trim().max(1000).allow("").optional().messages({
    "string.max": "Las notas no pueden exceder 1000 caracteres",
  }),

  imagen: Joi.string().max(500000).allow("").optional().messages({
    "string.max": "La imagen es demasiado grande",
  }),

  fechaIngreso: Joi.date().optional(),
});

/**
 * Schema para actualizar item de inventario
 */
const actualizarInventarioSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(200).optional().messages({
    "string.empty": "El nombre no puede estar vacío",
    "string.min": "El nombre debe tener al menos 1 caracter",
    "string.max": "El nombre no puede exceder 200 caracteres",
  }),

  categoria: Joi.string().trim().max(100).allow("").optional().messages({
    "string.max": "La categoría no puede exceder 100 caracteres",
  }),

  serie: Joi.string().trim().max(100).allow("").optional().messages({
    "string.max": "El número de serie no puede exceder 100 caracteres",
  }),

  estado: Joi.string()
    .valid("almacen", "en_reparacion", "entregado", "prestado")
    .optional()
    .messages({
      "any.only":
        'El estado debe ser "almacen", "en_reparacion", "entregado" o "prestado"',
    }),

  prestadoA: Joi.string().trim().max(200).allow("").optional().messages({
    "string.max": "El nombre de la persona no puede exceder 200 caracteres",
  }),

  fechaPrestamo: Joi.date().optional(),

  fechaDevolucionEstimada: Joi.date().optional(),

  cliente: Joi.string().trim().max(200).allow("").optional().messages({
    "string.max": "El nombre del cliente no puede exceder 200 caracteres",
  }),

  notas: Joi.string().trim().max(1000).allow("").optional().messages({
    "string.max": "Las notas no pueden exceder 1000 caracteres",
  }),

  imagen: Joi.string().max(500000).allow("").optional().messages({
    "string.max": "La imagen es demasiado grande",
  }),
}).min(1); // Al menos un campo debe ser actualizado

module.exports = {
  crearInventarioSchema,
  actualizarInventarioSchema,
};
