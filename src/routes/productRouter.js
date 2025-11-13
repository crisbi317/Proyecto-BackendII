import { Router } from 'express';
import ProductRepository from '../repositories/productRepository.js';
import { uploader } from '../utils/multerUtil.js';
import passport from 'passport';
import { requireAdmin } from '../middleware/autorize.js';

const router = Router();

const authenticate = passport.authenticate('current', { session: false });


router.get('/', async (req, res) => {
  try {
    const result = await ProductRepository.getAll(req.query);
    res.json({
      status: 'success',
      payload: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const result = await ProductRepository.getById(req.params.pid);
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

router.post('/', 
  authenticate,  
  requireAdmin,  
  uploader.array('thumbnails', 3), 
  async (req, res) => {
    if (req.files) {
      req.body.thumbnails = req.files.map(file => file.path);
    }

    try {
      const result = await ProductRepository.create(req.body);
      res.json({
        status: 'success',
        message: 'Producto creado exitosamente',
        payload: result
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
});

router.put('/:pid', 
  authenticate,
  requireAdmin,
  uploader.array('thumbnails', 3), 
  async (req, res) => {
    if (req.files) {
      req.body.thumbnails = req.files.map(file => file.filename);
    }

    try {
      const result = await ProductRepository.update(req.params.pid, req.body);
      res.json({
        status: 'success',
        message: 'Producto actualizado exitosamente',
        payload: result
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
});

router.delete('/:pid', 
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await ProductRepository.delete(req.params.pid);
      res.json({
        status: 'success',
        message: 'Producto eliminado exitosamente',
        payload: result
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
});

export default router;