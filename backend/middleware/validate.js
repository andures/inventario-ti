/**
 * Middleware de validación genérico
 * Valida el body, params o query según el schema de Joi proporcionado
 */

const validate = (schema, property = "body") => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false, // Retorna todos los errores, no solo el primero
        stripUnknown: true, // Elimina propiedades no definidas en el schema
      });

      if (error) {
        // Extraer mensajes de error
        const errors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Error de validación",
          errors,
        });
      }

      // Reemplazar req[property] con los valores validados y sanitizados
      req[property] = value;
      next();
    } catch (err) {
      console.error("Error en middleware de validación:", err);
      return res.status(500).json({
        success: false,
        message: "Error interno en la validación",
      });
    }
  };
};

module.exports = validate;
