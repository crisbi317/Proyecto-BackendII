import express from 'express';
import handlebars from 'express-handlebars';
import {Server} from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import sessionsRouter from './routers/sessionsRouter.js';
import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import __dirname from './utils/constantsUtil.js';
import websocket from './websocket.js';
import cookieParser from 'cookie-parser';
//import { dot } from 'node:test/reporters';

const app = express();

const uri = process.env.MONGO_URI;
mongoose.connect(uri);

dotenv.config();

const hbs= handlebars.create({
    helpers: {
        eq:(a,b) => a===b
    }
});

//Handlebars Config
app.engine('handlebars', hbs.engine());
app.set('views', __dirname + '/../views');
app.set('view engine', 'handlebars');

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser(""));
app.use(express.static('public'));



//Routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/', viewsRouter);
app.use('/api/sessions', sessionsRouter);

const PORT = process.env.PORT || 8080;
const httpServer = app.listen(PORT, () => {
    console.log(`Start server in PORT ${PORT}`);
});

const io = new Server(httpServer);

websocket(io);