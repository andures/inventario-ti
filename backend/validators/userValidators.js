const Joi = require("joi");

/**
 * Schemas de validación para gestión de usuarios
 */

// Schema para actualizar rol
const actualizarRolSchema = Joi.object({
  rol: Joi.string().valid("administrador_ti", "ti").required().messages({
    "any.only": "El rol debe ser 'administrador_ti' o 'ti'",
    "any.required": "El rol es obligatorio",
  }),
});

// Schema para cambiar estado (activo/inactivo)
const cambiarEstadoSchema = Joi.object({
  activo: Joi.boolean().required().messages({
    "boolean.base": "El estado debe ser verdadero o falso",
    "any.required": "El estado es obligatorio",
  }),
});

// Schema para validar ID de MongoDB
const mongoIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "El ID proporcionado no es válido",
      "any.required": "El ID es obligatorio",
    }),
});

module.exports = {
  actualizarRolSchema,
  cambiarEstadoSchema,
  mongoIdSchema,
};
