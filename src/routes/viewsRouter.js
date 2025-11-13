import { Router } from 'express';
import ProductRepository from '../repositories/productRepository.js';
import CartRepository from '../repositories/cartRepository.js';
import passport from 'passport';
import { requireAdmin } from '../middleware/autorize.js';   

const router = Router();

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

router.get('/admin', requireAuth, requireAdmin, (req, res) => {
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

router.get('/realtimeproducts', requireAuth, requireAdmin, async (req, res) => {
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

router.get('/', (req, res) => {
  res.redirect('/products');
});

export default router;