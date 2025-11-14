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
    const resetUrl = `${process.env.BASE_URL || 'http://localhost:8080'}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: '🔐 Restablecer Contraseña - Acción Requerida',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔐 Restablecer Contraseña</h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hola,
                      </p>
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si fuiste tú quien lo solicitó, haz clic en el botón de abajo para crear una nueva contraseña.
                      </p>
                      
                      <!-- Button -->
                      <table role="presentation" style="margin: 30px 0; width: 100%;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                              Restablecer mi Contraseña
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                        O copia y pega este enlace en tu navegador:
                      </p>
                      <p style="margin: 0 0 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #667eea; word-break: break-all; color: #667eea; font-size: 14px;">
                        ${resetUrl}
                      </p>
                      
                      <!-- Important Notice -->
                      <table role="presentation" style="margin: 30px 0; width: 100%; background-color: #fff3cd; border-left: 4px solid #ffc107;">
                        <tr>
                          <td style="padding: 15px;">
                            <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                              ⏰ <strong>Importante:</strong> Este enlace expirará en <strong>1 hora</strong> por razones de seguridad.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                        Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu contraseña actual permanecerá sin cambios.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0 0 10px; color: #6c757d; font-size: 14px;">
                        Este es un correo automático, por favor no respondas a este mensaje.
                      </p>
                      <p style="margin: 0; color: #6c757d; font-size: 12px;">
                        © ${new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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
      return { success: false };
    }
  }

  async sendPurchaseConfirmation(email, ticket) {
    const productsHtml = ticket.products.map(item => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${item.product?.title || 'Producto'}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: `Confirmación de Compra - Ticket ${ticket.code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4CAF50;">¡Compra Exitosa!</h1>
          <p>Gracias por tu compra. A continuación los detalles de tu pedido:</p>
          
          <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Código de Ticket:</strong> ${ticket.code}</p>
            <p><strong>Fecha:</strong> ${new Date(ticket.purchase_datetime).toLocaleString('es-ES')}</p>
            <p><strong>Total:</strong> $${ticket.amount.toFixed(2)}</p>
          </div>

          <h2>Productos:</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #4CAF50; color: white;">
                <th style="padding: 10px; border: 1px solid #ddd;">Producto</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Cantidad</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Precio Unit.</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productsHtml}
            </tbody>
          </table>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666;">Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
            <p style="color: #666;">¡Gracias por tu preferencia!</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Error al enviar email de confirmación:', error);
      // No lanzar error para no bloquear la compra
      return { success: false };
    }
  }
}

export default new MailService();