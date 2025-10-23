const Joi = require("joi");

/**
 * Lista de contraseñas comunes prohibidas
 */
const commonPasswords = [
  "password",
  "password123",
  "12345678",
  "qwerty123",
  "admin123",
  "letmein",
  "welcome",
  "monkey",
  "1234567890",
  "password1",
  "123456789",
  "12345678910",
  "qwertyuiop",
  "administrador",
  "abcd1234",
  "Password1",
  "Password123",
  "Admin123",
  "User1234",
];

/**
 * Validación personalizada para contraseñas seguras
 */
const passwordValidator = (value, helpers) => {
  // Verificar contraseñas comunes
  if (
    commonPasswords.some((p) => value.toLowerCase().includes(p.toLowerCase()))
  ) {
    return helpers.error("password.common");
  }

  // Verificar caracteres repetidos (más de 3 seguidos)
  if (/(.)\1{3,}/.test(value)) {
    return helpers.error("password.repeated");
  }

  // Verificar secuencias comunes (123, abc, etc.)
  const sequences = [
    "123",
    "234",
    "345",
    "456",
    "567",
    "678",
    "789",
    "abc",
    "bcd",
    "cde",
    "def",
  ];
  if (sequences.some((seq) => value.toLowerCase().includes(seq))) {
    return helpers.error("password.sequence");
  }

  return value;
};

/**
 * Schemas de validación para autenticación
 */

// Schema para registro de usuario
const registrarSchema = Joi.object({
  nombre: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "El nombre es obligatorio",
    "string.min": "El nombre debe tener al menos 3 caracteres",
    "string.max": "El nombre no puede exceder 100 caracteres",
    "any.required": "El nombre es obligatorio",
  }),

  email: Joi.string().trim().email().lowercase().required().messages({
    "string.empty": "El email es obligatorio",
    "string.email": "Debe proporcionar un email válido",
    "any.required": "El email es obligatorio",
  }),

  password: Joi.string()
    .min(12) // Aumentado de 8 a 12
    .max(128)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?])"
      )
    )
    .custom(passwordValidator)
    .required()
    .messages({
      "string.empty": "La contraseña es obligatoria",
      "string.min": "La contraseña debe tener al menos 12 caracteres",
      "string.max": "La contraseña no puede exceder 128 caracteres",
      "string.pattern.base":
        "La contraseña debe contener: mayúscula, minúscula, número y caracter especial (!@#$%^&*)",
      "password.common":
        "Esta contraseña es demasiado común. Por favor elige una más segura",
      "password.repeated":
        "La contraseña no debe contener más de 3 caracteres repetidos consecutivos",
      "password.sequence":
        "La contraseña no debe contener secuencias comunes (123, abc, etc.)",
      "any.required": "La contraseña es obligatoria",
    }),

  rol: Joi.string().valid("administrador_ti", "ti").default("ti").messages({
    "any.only": "El rol debe ser 'administrador_ti' o 'ti'",
  }),
});

// Schema para login
const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    "string.empty": "El email es obligatorio",
    "string.email": "Debe proporcionar un email válido",
    "any.required": "El email es obligatorio",
  }),

  password: Joi.string().required().messages({
    "string.empty": "La contraseña es obligatoria",
    "any.required": "La contraseña es obligatoria",
  }),
});

// Schema para olvidé mi password
const olvideMiPasswordSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    "string.empty": "El email es obligatorio",
    "string.email": "Debe proporcionar un email válido",
    "any.required": "El email es obligatorio",
  }),
});

// Schema para reset password
const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(12) // Aumentado de 8 a 12
    .max(128)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?])"
      )
    )
    .custom(passwordValidator)
    .required()
    .messages({
      "string.empty": "La contraseña es obligatoria",
      "string.min": "La contraseña debe tener al menos 12 caracteres",
      "string.max": "La contraseña no puede exceder 128 caracteres",
      "string.pattern.base":
        "La contraseña debe contener: mayúscula, minúscula, número y caracter especial (!@#$%^&*)",
      "password.common":
        "Esta contraseña es demasiado común. Por favor elige una más segura",
      "password.repeated":
        "La contraseña no debe contener más de 3 caracteres repetidos consecutivos",
      "password.sequence":
        "La contraseña no debe contener secuencias comunes (123, abc, etc.)",
      "any.required": "La contraseña es obligatoria",
    }),
});

module.exports = {
  registrarSchema,
  loginSchema,
  olvideMiPasswordSchema,
  resetPasswordSchema,
};
