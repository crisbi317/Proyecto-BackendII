import UserRepository from '../repositories/userRepository.js';
import UserDTO from '../dto/userDTO.js';
import MailService from '../services/mailService.js';
import { PasswordResetToken } from '../dao/models/passwordResetTokenModel.js';
import { hashPassword, comparePassword } from '../utils/passwordUtil.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'secretJWT';

//registro
export const registerUser = async (req, res) => {
    res.redirect('/login');
};

export const handleRegisterFailure = (req, res) => {
  res.status(400).render('register', { 
    error: 'Error en el registro. El usuario puede ya existir.' 
  });
};

//login
export const loginUser = async (req, res) => {
  try {
    const user = req.user; 

    const token = jwt.sign({ 
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        cart: user.cart
      }
    }, JWT_SECRET, { expiresIn: '1h' });

    res.cookie('jwt', token, { 
      httpOnly: true,
      maxAge: 3600000 
    });

    res.redirect('/profile');
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).render('login', { error: 'Error en el login' });
  }
};

export const handleLoginFailure = (req, res) => {
  res.status(401).render('login', { error: 'Credenciales inválidas' });
};

//usuario actual
export const getCurrentUser = (req, res) => {
  
  const userDTO = new UserDTO(req.user);
  
  res.json({ 
    status: 'success',
    user: userDTO 
  });
};

//gestion de contraseña olvidada
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await UserRepository.getByEmail(email);
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'No existe un usuario con ese email' 
      });
    }

    // Crear token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Guardar token 
    await PasswordResetToken.create({
      userId: user._id,
      token: resetToken
    });

    // Enviar email recuperación
    await MailService.sendPasswordResetEmail(email, resetToken);

    res.json({ 
      status: 'success',
      message: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña' 
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error al procesar la solicitud' 
    });
  }
};

//resetear contraseña
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validar token existente
    const resetToken = await PasswordResetToken.findOne({ token });
    if (!resetToken) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Token inválido o expirado' 
      });
    }

    // Obtener usuario
    const user = await UserRepository.getById(resetToken.userId);
    
    // Validar nueva contraseña diferente
    const isSamePassword = comparePassword(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        status: 'error',
        message: 'La nueva contraseña debe ser diferente a la anterior' 
      });
    }

    // Actualizar contraseña
    const hashedPassword = hashPassword(newPassword);
    await UserRepository.updatePassword(user._id, hashedPassword);

    // Eliminar token usado
    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    res.json({ 
      status: 'success',
      message: 'Contraseña actualizada exitosamente' 
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error al restablecer la contraseña' 
    });
  }
};
