import User from '../dao/models/User.js';
import { comparePassword } from '../utils/passwordUtil.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    const isValid = comparePassword(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    }}, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('jwt',token,{ httpOnly:true}).redirect('/profile');
  } catch (error) {
    res.status(500).render('login',{ error: 'Error en el login' });
  }
};

export const getCurrentUser = (req, res) => {
  res.json({ user: req.user });
};