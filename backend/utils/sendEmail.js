const nodemailer = require("nodemailer");

/**
 * Enviar email
 * @param {Object} options - Opciones del email
 * @param {string} options.email - Email del destinatario
 * @param {string} options.subject - Asunto del email
 * @param {string} options.message - Contenido HTML del email
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
  try {
    // Crear transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Definir opciones del email
    const mailOptions = {
      from:
        process.env.EMAIL_FROM || `Inventario TI <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Email enviado: ${info.messageId}`);

    return info;
  } catch (error) {
    console.error("❌ Error enviando email:", error.message);
    throw new Error("No se pudo enviar el email");
  }
};

module.exports = sendEmail;
