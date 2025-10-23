/**
 * Constantes de la aplicación
 */

// Roles de usuario
exports.ROLES = {
  ADMIN: "administrador_ti",
  TI: "ti",
};

// Estados de usuario
exports.ESTADOS_USUARIO = {
  ACTIVO: true,
  INACTIVO: false,
};

// Tipos de items de inventario
exports.TIPOS_ITEMS = {
  COMPUTADORA: "computadora",
  IMPRESORA: "impresora",
  CABLE_VIDEO: "cable_video",
  CABLE_PODER: "cable_poder",
  DATASHOW: "datashow",
  MONITOR: "monitor",
  TECLADO: "teclado",
  MOUSE: "mouse",
  OTRO: "otro",
};

// Estados de items de inventario
exports.ESTADOS_ITEMS = {
  DISPONIBLE: "disponible",
  EN_REPARACION: "en_reparacion",
  EN_USO: "en_uso",
  DANADO: "dañado",
  PARA_REPUESTO: "para_repuesto",
};

// Mensajes de error comunes
exports.MENSAJES_ERROR = {
  NO_AUTORIZADO: "No autorizado para acceder a esta ruta",
  TOKEN_INVALIDO: "Token no válido o expirado",
  CREDENCIALES_INVALIDAS: "Credenciales inválidas",
  USUARIO_NO_ENCONTRADO: "Usuario no encontrado",
  USUARIO_INACTIVO: "Usuario inactivo. Contacte al administrador",
  EMAIL_YA_EXISTE: "El email ya está registrado",
  ROL_NO_VALIDO: "Rol no válido",
  CAMPOS_REQUERIDOS: "Por favor proporcione todos los campos requeridos",
  ERROR_SERVIDOR: "Error interno del servidor",
};

// Mensajes de éxito
exports.MENSAJES_EXITO = {
  REGISTRO_EXITOSO: "Usuario registrado exitosamente",
  LOGIN_EXITOSO: "Login exitoso",
  LOGOUT_EXITOSO: "Logout exitoso",
  ACTUALIZACION_EXITOSA: "Actualización exitosa",
  ELIMINACION_EXITOSA: "Eliminación exitosa",
  EMAIL_ENVIADO: "Email enviado correctamente",
  PASSWORD_ACTUALIZADO: "Contraseña actualizada exitosamente",
};

// Configuración de paginación
exports.PAGINACION = {
  LIMITE_DEFAULT: 10,
  LIMITE_MAXIMO: 100,
};
