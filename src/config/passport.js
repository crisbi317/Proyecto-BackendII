import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../dao/models/User.js';
import bcrypt from 'bcrypt';

passport.use('login', new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return done(null, false, { message: 'Credenciales inválidas' });
    }
    return done(null, user);
  }
));