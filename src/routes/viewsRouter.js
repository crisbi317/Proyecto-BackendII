import { Router } from 'express';
import { productDBManager } from '../dao/productDBManager.js';
import { cartDBManager } from '../dao/cartDBManager.js';
import { requireAuth } from '../middleware/viewAuth.js';    
import { requireAdmin } from '../middleware/roleAuth.js';   

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});

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

router.get('/products', async (req, res) => {
    const products = await ProductService.getAllProducts(req.query);

    res.render(
        'index',
        {
            title: 'Productos',
            style: 'index.css',
            products: JSON.parse(JSON.stringify(products.docs)),
            prevLink: {
                exist: products.prevLink ? true : false,
                link: products.prevLink
            },
            nextLink: {
                exist: products.nextLink ? true : false,
                link: products.nextLink
            }
        }
    )
});

router.get('/realtimeproducts', async (req, res) => {
    const products = await ProductService.getAllProducts(req.query);
    res.render(
        'realTimeProducts',
        {
            title: 'Productos',
            style: 'index.css',
            products: JSON.parse(JSON.stringify(products.docs))
        }
    )
});

router.get('/cart/:cid', async (req, res) => {
    const response = await CartService.getProductsFromCartByID(req.params.cid);

    if (response.status === 'error') {
        return res.render(
            'notFound',
            {
                title: 'Not Found',
                style: 'index.css'
            }
        );
    }

    res.render(
        'cart',
        {
            title: 'Carrito',
            style: 'index.css',
            products: JSON.parse(JSON.stringify(response.products))
        }
    )
});

export default router;