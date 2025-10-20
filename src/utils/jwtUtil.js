import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign({ user }, 'secretJWT', { expiresIn: '1h' });
};
