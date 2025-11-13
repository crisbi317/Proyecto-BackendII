import express from 'express';
import passport from 'passport';
import { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  handleRegisterFailure, 
  handleLoginFailure,
  forgotPassword,
  resetPassword
} from '../controllers/sessionsController.js';

const router = express.Router();

//registrar usuario
router.post('/register', 
  passport.authenticate('register', { 
    session: false,
    failureRedirect: '/register'
  }), 
  registerUser
);

// errores de registro
router.post('/register-error', handleRegisterFailure);

//login y autenticacion
router.post('/login', 
  passport.authenticate('login', { 
    session: false,
    failureRedirect: '/login'
  }), 
  loginUser
);

// errores de login
router.post('/login-error', handleLoginFailure);

//actual con jwt
router.get('/current', 
  passport.authenticate('current', { session: false }),
  getCurrentUser
);

//recuperar contraseña
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
