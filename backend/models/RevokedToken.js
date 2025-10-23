const mongoose = require("mongoose");

const revokedTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true, // Indexar para búsquedas rápidas
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["access", "refresh"],
      required: true,
    },
    reason: {
      type: String,
      enum: ["logout", "security", "expired", "admin"],
      default: "logout",
    },
    expiresAt: {
      type: Date,
      required: true,
      // Índice TTL manejado por schema.index() abajo
    },
    revokedBy: {
      type: String, // IP o userId del que revocó
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL Index - MongoDB eliminará automáticamente los documentos expirados
revokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Método estático: verificar si un token está revocado
revokedTokenSchema.statics.isRevoked = async function (token) {
  const revoked = await this.findOne({ token });
  return !!revoked;
};

// Método estático: revocar un token
revokedTokenSchema.statics.revokeToken = async function (
  token,
  userId,
  type,
  expiresAt,
  revokedBy,
  reason = "logout"
) {
  return await this.create({
    token,
    userId,
    type,
    expiresAt,
    revokedBy,
    reason,
  });
};

// Método estático: revocar todos los tokens de un usuario
revokedTokenSchema.statics.revokeAllUserTokens = async function (
  userId,
  revokedBy,
  reason = "security"
) {
  // Esto requeriría almacenar todos los tokens activos
  // Por simplicidad, solo marcamos la acción en logs
  const User = mongoose.model("User");
  const user = await User.findById(userId);

  if (user && user.refreshToken) {
    // Revocar el refresh token almacenado
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    await this.create({
      token: user.refreshToken,
      userId,
      type: "refresh",
      expiresAt,
      revokedBy,
      reason,
    });

    // Limpiar el refresh token del usuario
    user.refreshToken = null;
    await user.save();
  }

  return { success: true, message: "Tokens revocados" };
};

// Método estático: limpiar tokens expirados manualmente (backup del TTL)
revokedTokenSchema.statics.cleanExpired = async function () {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  return result.deletedCount;
};

const RevokedToken = mongoose.model("RevokedToken", revokedTokenSchema);

module.exports = RevokedToken;
