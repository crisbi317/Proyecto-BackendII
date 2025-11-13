import express from 'express';
import { create } from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import passport from 'passport';
import cookieParser from 'cookie-parser';

import config from './config/environment.js';
import './config/passport.js';

import sessionsRouter from './routes/sessionsRouter.js';
import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import viewsRouter from './routes/viewsRouter.js';

import __dirname from './utils/constantsUtil.js';
import websocket from './websocket.js';

const app = express();
mongoose.connect(config.MONGO_URI)
  .then(() => console.log(' Conectado a MongoDB'))
  .catch(err => console.error(' Error conectando a MongoDB:', err));

//handlebars
const hbs = create({
  helpers: {
    eq: (a, b) => a === b
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
});

app.engine('handlebars', hbs.engine);
app.set('views', __dirname + '/../views');
app.set('view engine', 'handlebars');

//midlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.COOKIE_SECRET));
app.use(express.static('public'));
app.use(passport.initialize());

//rutas
app.use('/api/sessions', sessionsRouter);
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/', viewsRouter);


app.use((req, res) => {
  res.status(404).render('notFound', {
    title: 'Página no encontrada',
    style: 'index.css'
  });
});


const httpServer = app.listen(config.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${config.PORT}`);
  console.log(` Mail service: ${config.MAIL_SERVICE}`);
  console.log(` JWT configurado`);
});

const io = new Server(httpServer);
websocket(io);

export default app;