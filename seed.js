const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./backend/models/User");

/**
 * Script para crear usuario administrador inicial
 * Ejecutar: node seed.js
 *
 * IMPORTANTE: Las credenciales se toman de las variables de entorno (.env)
 * para mayor seguridad.
 */

const seedAdmin = async () => {
  try {
    // Validar que existan las variables de entorno necesarias
    if (
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD ||
      !process.env.ADMIN_NOMBRE
    ) {
      console.error("❌ Error: Faltan variables de entorno");
      console.error("Por favor configura en el archivo .env:");
      console.error("  - ADMIN_NOMBRE");
      console.error("  - ADMIN_EMAIL");
      console.error("  - ADMIN_PASSWORD");
      process.exit(1);
    }

    // Validar contraseña segura
    if (process.env.ADMIN_PASSWORD.length < 8) {
      console.error("❌ Error: La contraseña debe tener al menos 8 caracteres");
      process.exit(1);
    }

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Verificar si ya existe un administrador
    const adminExiste = await User.findOne({ rol: "administrador_ti" });

    if (adminExiste) {
      console.log("⚠️  Ya existe un usuario administrador en la base de datos");
      console.log(`📧 Email: ${adminExiste.email}`);
      console.log(`👤 Nombre: ${adminExiste.nombre}`);
      process.exit(0);
    }

    // Crear usuario administrador usando variables de entorno
    const admin = await User.create({
      nombre: process.env.ADMIN_NOMBRE,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      rol: "administrador_ti",
      activo: true,
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Usuario administrador creado exitosamente");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:", admin.email);
    console.log("� Nombre:", admin.nombre);
    console.log("👤 Rol:", admin.rol);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  IMPORTANTE: Las credenciales están en el archivo .env");
    console.log("⚠️  NO compartas el archivo .env (ya está en .gitignore)");
    console.log("⚠️  Cambia la contraseña después del primer login");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

// Ejecutar seed
seedAdmin();
