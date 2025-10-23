const User = require("../models/User");

/**
 * @desc    Obtener todos los usuarios
 * @route   GET /api/users
 * @access  Private (solo administrador_ti)
 */
exports.obtenerUsuarios = async (req, res) => {
  try {
    const { activo, rol } = req.query;
    const filtro = {};

    // Filtros opcionales
    if (activo !== undefined) {
      filtro.activo = activo === "true";
    }

    if (rol) {
      filtro.rol = rol;
    }

    const usuarios = await User.find(filtro)
      .select("-refreshToken -resetPasswordToken -resetPasswordExpire")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: usuarios.length,
      data: usuarios,
    });
  } catch (error) {
    console.error("Error en obtenerUsuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
};

/**
 * @desc    Obtener usuario por ID
 * @route   GET /api/users/:id
 * @access  Private (solo administrador_ti)
 */
exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id).select(
      "-refreshToken -resetPasswordToken -resetPasswordExpire"
    );

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    console.error("Error en obtenerUsuarioPorId:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
};

/**
 * @desc    Actualizar rol de usuario
 * @route   PUT /api/users/:id/rol
 * @access  Private (solo administrador_ti)
 */
exports.actualizarRol = async (req, res) => {
  try {
    const { rol } = req.body;

    if (!rol) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporcione un rol",
      });
    }

    if (!["administrador_ti", "ti"].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol no válido. Debe ser "administrador_ti" o "ti"',
      });
    }

    // No permitir que un admin se cambie su propio rol
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "No puedes cambiar tu propio rol",
      });
    }

    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      { rol },
      { new: true, runValidators: true }
    ).select("-refreshToken -resetPasswordToken -resetPasswordExpire");

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Rol actualizado exitosamente",
      data: usuario,
    });
  } catch (error) {
    console.error("Error en actualizarRol:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar rol",
      error: error.message,
    });
  }
};

/**
 * @desc    Activar/Desactivar usuario
 * @route   PUT /api/users/:id/estado
 * @access  Private (solo administrador_ti)
 */
exports.cambiarEstado = async (req, res) => {
  try {
    const { activo } = req.body;

    if (activo === undefined) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporcione el estado (activo: true/false)",
      });
    }

    // No permitir que un admin se desactive a sí mismo
    if (req.params.id === req.user.id.toString() && activo === false) {
      return res.status(400).json({
        success: false,
        message: "No puedes desactivarte a ti mismo",
      });
    }

    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      { activo },
      { new: true, runValidators: true }
    ).select("-refreshToken -resetPasswordToken -resetPasswordExpire");

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Invalidar refresh token si se desactiva
    if (!activo) {
      usuario.refreshToken = undefined;
      await usuario.save();
    }

    res.json({
      success: true,
      message: `Usuario ${activo ? "activado" : "desactivado"} exitosamente`,
      data: usuario,
    });
  } catch (error) {
    console.error("Error en cambiarEstado:", error);
    res.status(500).json({
      success: false,
      message: "Error al cambiar estado del usuario",
      error: error.message,
    });
  }
};

/**
 * @desc    Eliminar usuario
 * @route   DELETE /api/users/:id
 * @access  Private (solo administrador_ti)
 */
exports.eliminarUsuario = async (req, res) => {
  try {
    // No permitir que un admin se elimine a sí mismo
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "No puedes eliminarte a ti mismo",
      });
    }

    const usuario = await User.findByIdAndDelete(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Usuario eliminado exitosamente",
      data: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error("Error en eliminarUsuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
};
