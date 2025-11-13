import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT || 8080,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce',
  JWT_SECRET: process.env.JWT_SECRET || 'secretJWT',
  COOKIE_SECRET: process.env.COOKIE_SECRET || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  BASE_URL: process.env.BASE_URL || 'http://localhost:8080',
  MAIL_SERVICE: process.env.MAIL_SERVICE || 'gmail',
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD
};

export default config;