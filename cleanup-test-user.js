// Script para eliminar usuario de test antes de ejecutar test-2fa.ps1
require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./backend/models/User");

const cleanupTestUser = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Eliminar usuario de test
    const testEmail = "user2fa@example.com";
    const result = await User.deleteOne({ email: testEmail });

    if (result.deletedCount > 0) {
      console.log(`✅ Usuario eliminado: ${testEmail}`);
    } else {
      console.log(`ℹ️  Usuario no encontrado: ${testEmail}`);
    }

    // Cerrar conexión
    await mongoose.connection.close();
    console.log("✅ Conexión cerrada");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

cleanupTestUser();
