import { Router } from 'express';
import ProductRepository from '../repositories/productRepository.js';
import CartRepository from '../repositories/cartRepository.js';
import passport from 'passport';
import { requireAdmin } from '../middleware/autorize.js';   

const router = Router();

// Middleware para autenticación en vistas
const requireAuth = (req, res, next) => {
  passport.authenticate('current', { session: false }, (err, user, info) => {
    if (err) {
      return res.redirect('/login');
    }
    if (!user) {
      return res.redirect('/login');
    }
    req.user = user;
    next();
  })(req, res, next);
};

// Middleware para verificar que es admin en vistas
const requireAdminView = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).render('error', { 
      error: 'Acceso denegado: solo administradores',
      user: req.user 
    });
  }
  
  next();
};

//autenticacion
router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/forgot-password', (req, res) => {
  res.render('forgot-password');
});

router.get('/reset-password/:token', (req, res) => {
  res.render('reset-password', { token: req.params.token });
});

//vista protegida
router.get('/profile', requireAuth, (req, res) => {
  res.render('profile', { user: req.user });
}); 

router.get('/admin', requireAuth, requireAdminView, (req, res) => {
  res.render('admin', { user: req.user });
});

router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/login');
});


//productos
router.get('/products', (req, res, next) => {
  // Intentar autenticar pero continuar si falla
  passport.authenticate('current', { session: false }, async (err, user) => {
    try {
      const products = await ProductRepository.getAll(req.query);

      res.render('index', {
        title: 'Productos',
        style: 'index.css',
        products: JSON.parse(JSON.stringify(products.docs)),
        user: user || null, // Pasar usuario si existe
        prevLink: {
          exist: products.prevLink ? true : false,
          link: products.prevLink
        },
        nextLink: {
          exist: products.nextLink ? true : false,
          link: products.nextLink
        }
      });
    } catch (error) {
      res.status(500).render('error', { error: error.message });
    }
  })(req, res, next);
});

router.get('/realtimeproducts', requireAuth, requireAdminView, async (req, res) => {
  try {
    const products = await ProductRepository.getAll(req.query);
    res.render('realTimeProducts', {
      title: 'Productos en Tiempo Real',
      style: 'index.css',
      products: JSON.parse(JSON.stringify(products.docs)),
      user: req.user
    });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

// carrito
router.get('/cart/:cid', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.cart.toString() !== req.params.cid) {
      return res.status(403).render('error', { 
        error: 'No tienes permiso para acceder a este carrito',
        user: req.user 
      });
    }

    const cart = await CartRepository.getById(req.params.cid);
    res.render('cart', {
      title: 'Carrito',
      style: 'index.css',
      products: JSON.parse(JSON.stringify(cart.products)),
      cartId: req.params.cid,
      user: req.user
    });
  } catch (error) {
    res.status(404).render('notFound', {
      title: 'Not Found',
      style: 'index.css'
    });
  }
});

// tickets
router.get('/ticket/:code', requireAuth, async (req, res) => {
  try {
    const TicketRepository = (await import('../repositories/ticketRepository.js')).default;
    const ticket = await TicketRepository.findByCode(req.params.code);
    
    if (!ticket) {
      return res.status(404).render('error', { 
        error: 'Ticket no encontrado',
        user: req.user 
      });
    }

    // Verificar que el ticket pertenece al usuario o es admin
    if (req.user.role !== 'admin' && ticket.purchaser !== req.user.email) {
      return res.status(403).render('error', { 
        error: 'No tienes permiso para ver este ticket',
        user: req.user 
      });
    }

    res.render('ticket', {
      title: 'Detalle de Compra',
      style: 'index.css',
      ticket: JSON.parse(JSON.stringify(ticket)),
      user: req.user
    });
  } catch (error) {
    res.status(500).render('error', { 
      error: error.message,
      user: req.user 
    });
  }
});

router.get('/', (req, res) => {
  res.redirect('/products');
});

export default router;