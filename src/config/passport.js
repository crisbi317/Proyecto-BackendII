//import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import User from '../dao/models/User.js';
import { hashPassword, comparePassword } from '../utils/passwordUtil.js';
import { cartDBManager } from '../dao/cartDBManager.js';
import { productDBManager } from '../dao/productDBManager.js';

const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);
// Cargar variables de entorno
//dotenv.config();

//const SECRET_KEY = process.env.JWT_SECRET;

passport.use('register', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  async (req, email, password, done) => {
    try {
      const { first_name, last_name, age } = req.body;

      // Usuario ya existe?
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return done(null, false, { message: 'El usuario ya existe' });
      }

      // Nuevo carrito para usuario
      const newCart = await CartService.createCart();

      // Nuevo usuario
      const newUser = await User.create({
        first_name,
        last_name,
        email,
        age,
        password: hashPassword(password),
        cart: newCart._id,
        role: email === 'adminCoder@coder.com' ? 'admin' : 'user'
      });

      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }
));

//login
passport.use('login', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Buscar usuario
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }

      // Verificar contraseña
      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

//jwt
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  return token;
};

passport.use('current', new JWTStrategy(
  {
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: process.env.JWT_SECRET || 'secretJWT'
  },
  async (jwt_payload, done) => {
    try {
      // jwt_payload contiene el objeto user que firmamos en el token
      const user = await User.findById(jwt_payload.user._id);
      
      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));

export default passport;