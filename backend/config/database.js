const mongoose = require("mongoose");

/**
 * Conectar a MongoDB
 */
const connectDB = async () => {
  try {
    // Verificar que MONGO_URI esté definida
    if (!process.env.MONGO_URI) {
      console.error(
        "❌ MONGO_URI no está definida en las variables de entorno"
      );
      console.error("🔧 Asegúrate de configurar MONGO_URI en Railway");
      process.exit(1);
    }

    console.log("🔄 Intentando conectar a MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error conectando a MongoDB: ${error.message}`);
    console.error(
      "🔧 Verifica que MONGO_URI sea correcta en las variables de entorno"
    );
    process.exit(1);
  }
};

module.exports = connectDB;
