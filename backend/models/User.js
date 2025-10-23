const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Schema de Usuario
 * Define la estructura de los usuarios en la base de datos
 */
const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
      maxlength: [50, "El nombre no puede exceder 50 caracteres"],
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor ingrese un email válido",
      ],
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false, // No incluir password en las queries por defecto
    },
    rol: {
      type: String,
      enum: {
        values: ["administrador_ti", "ti"],
        message: 'El rol debe ser "administrador_ti" o "ti"',
      },
      default: "ti",
    },
    activo: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: String,
    // Campos para Two-Factor Authentication
    twoFactorSecret: {
      type: String,
      select: false, // No incluir en queries por defecto
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorBackupCodes: {
      type: [String],
      select: false, // No incluir en queries por defecto
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

/**
 * Middleware: Encriptar contraseña antes de guardar
 */
userSchema.pre("save", async function (next) {
  // Solo encriptar si la contraseña fue modificada
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Método de instancia: Comparar contraseñas
 * @param {string} passwordIngresada - Contraseña en texto plano a comparar
 * @returns {Promise<boolean>} - True si las contraseñas coinciden
 */
userSchema.methods.compararPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

/**
 * Método de instancia: Obtener objeto público del usuario
 * @returns {Object} - Usuario sin campos sensibles
 */
userSchema.methods.obtenerDatosPublicos = function () {
  return {
    id: this._id,
    nombre: this.nombre,
    email: this.email,
    rol: this.rol,
    activo: this.activo,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
