import { Router } from 'express';
import CartRepository from '../repositories/cartRepository.js';
import { purchaseCart } from '../controllers/cartController.js';
import passport from 'passport';
import { requireUser } from '../middleware/autorize.js';

const router = Router();
const authenticate = passport.authenticate('current', { session: false });

router.get('/:cid', authenticate, async (req, res) => {
  try {
    const result = await CartRepository.getById(req.params.cid);
    if (req.user.role !== 'admin' && req.user.cart.toString() !== req.params.cid) {
      return res.status(403).json({
        status: 'error',
        message: 'No tenes permiso para acceder a este carrito'
      });
    }

    res.json({
      status: 'success',
      payload: result
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await CartRepository.create();
    res.json({
      status: 'success',
      payload: result
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

router.post('/:cid/product/:pid', 
  authenticate,
  requireUser,
  async (req, res) => {
    try {
      
      if (req.user.cart.toString() !== req.params.cid) {
        return res.status(403).json({
          status: 'error',
          message: 'No se puede agregar productos a un carrito que no es tuyo'
        });
      }

      const result = await CartRepository.addProduct(req.params.cid, req.params.pid);
      res.json({
        status: 'success',
        message: 'Producto agregado al carrito',
        payload: result
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
});


router.delete('/:cid/product/:pid', 
  authenticate,
  requireUser,
  async (req, res) => {
    try {
      if (req.user.cart.toString() !== req.params.cid) {
        return res.status(403).json({
          status: 'error',
          message: 'No se puede eliminar productos de un carrito que no es tuyo'
        });
      }

      const result = await CartRepository.deleteProduct(req.params.cid, req.params.pid);
      res.json({
        status: 'success',
        message: 'Producto eliminado del carrito',
        payload: result
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
});

router.put('/:cid', 
  authenticate,
  requireUser,
  async (req, res) => {
    try {
      if (req.user.cart.toString() !== req.params.cid) {
        return res.status(403).json({
          status: 'error',
          message: 'No se puede modificar un carrito que no es tuyo'
        });
      }

      const result = await CartRepository.updateAllProducts(req.params.cid, req.body.products);
      res.json({
        status: 'success',
        message: 'Carrito actualizado',
        payload: result
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
});

router.put('/:cid/product/:pid', 
  authenticate,
  requireUser,
  async (req, res) => {
    try {
      if (req.user.cart.toString() !== req.params.cid) {
        return res.status(403).json({
          status: 'error',
          message: 'No se puede modificar un carrito que no es tuyo'
        });
      }

      const result = await CartRepository.updateProduct(
        req.params.cid, 
        req.params.pid, 
        req.body.quantity
      );
      res.json({
        status: 'success',
        message: 'Cantidad actualizada',
        payload: result
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
});

router.delete('/:cid', 
  authenticate,
  requireUser,
  async (req, res) => {
    try {
      if (req.user.cart.toString() !== req.params.cid) {
        return res.status(403).json({
          status: 'error',
          message: 'No se puede vaciar un carrito que no es tuyo'
        });
      }

      const result = await CartRepository.deleteAllProducts(req.params.cid);
      res.json({
        status: 'success',
        message: 'Carrito vaciado',
        payload: result
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
});


router.post('/:cid/purchase', 
  authenticate,
  requireUser,
  purchaseCart
);

export default router;