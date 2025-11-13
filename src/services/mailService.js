import nodemailer from 'nodemailer';

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
      }
    });
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.BASE_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Restablecer contraseña',
      html: `
        <h1>Restablecer contraseña</h1>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetUrl}">Restablecer contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste restablecer tu contraseña, ignora este correo.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Error al enviar email:', error);
      throw new Error('Error al enviar el email de recuperación');
    }
  }

  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Bienvenido a nuestra plataforma',
      html: `
        <h1>Bienvenido ${name}!</h1>
        <p>Gracias por registrarte en nuestra plataforma.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Error al enviar email de bienvenida:', error);
      // No lanzar error para no bloquear el registro
      return { success: false };
    }
  }
}

export default new MailService();