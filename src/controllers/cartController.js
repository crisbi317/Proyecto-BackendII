import CartRepository from '../repositories/cartRepository.js';
import ProductRepository from '../repositories/productRepository.js';
import TicketRepository from '../repositories/ticketRepository.js';
import MailService from '../services/mailService.js';

export const purchaseCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const purchaserEmail = req.user.email;

    // Verificar que el carrito pertenece al usuario
    if (req.user.cart.toString() !== cid) {
      return res.status(403).json({ 
        status: 'error',
        message: 'No se puede finalizar la compra de un carrito que no es tuyo' 
      });
    }

    // Obtener carrito
    const cart = await CartRepository.getById(cid);
    
    if (!cart.products || cart.products.length === 0) {
      return res.status(400).json({ 
        status: 'error',
        message: 'El carrito está vacío' 
      });
    }

    const productsToProcess = [];
    const productsNotProcessed = [];
    let totalAmount = 0;

    // Verificar stock 
    for (const item of cart.products) {
      const product = await ProductRepository.getById(item.product._id);
      
      if (product.stock >= item.quantity) {
          productsToProcess.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price,
          title: product.title
        });
        totalAmount += product.price * item.quantity;
      } else {
        
        productsNotProcessed.push({
          product: product._id,
          title: product.title,
          requestedQuantity: item.quantity,
          availableStock: product.stock
        });
      }
    }

    if (productsToProcess.length === 0) {
      return res.status(400).json({ 
        status: 'error',
        message: 'No hay productos con stock suficiente',
        productsNotProcessed 
      });
    }

    // Crear ticket
    const ticketData = {
      code: TicketRepository.generateCode(),
      purchase_datetime: new Date(),
      amount: totalAmount,
      purchaser: purchaserEmail,
      products: productsToProcess.map(p => ({
        product: p.product,
        quantity: p.quantity,
        price: p.price
      }))
    };

    const ticket = await TicketRepository.create(ticketData);

    // El stock ya fue reducido al agregar productos al carrito
    // No es necesario volver a reducirlo aquí
    
    // Si hay productos que no se pudieron procesar, devolver su stock al inventario
    for (const item of productsNotProcessed) {
      const cartItem = cart.products.find(p => p.product._id.toString() === item.product.toString());
      if (cartItem) {
        const product = await ProductRepository.getById(item.product);
        await ProductRepository.update(item.product, { 
          stock: product.stock + cartItem.quantity 
        });
      }
    }

    
    const remainingProducts = cart.products.filter(item => 
      productsNotProcessed.some(p => p.product.toString() === item.product._id.toString())
    );
    
    if (remainingProducts.length > 0) {
        await CartRepository.updateProducts(cid, remainingProducts);
    } else {
        // No devolver stock al vaciar el carrito después de compra exitosa
        await CartRepository.clearCart(cid, false);
    }

    // Enviar email de confirmación (no bloquea la compra si falla)
    try {
      await MailService.sendPurchaseConfirmation(purchaserEmail, ticket);
    } catch (emailError) {
      console.error('Error al enviar email de confirmación:', emailError.message);
      // No lanzar error, continuar con la compra
    }

    res.json({ 
      status: 'success',
      message: 'Compra realizada exitosamente',
      ticket: {
        code: ticket.code,
        amount: ticket.amount,
        purchaseDate: ticket.purchase_datetime,
        products: productsToProcess.map(p => ({
          title: p.title,
          quantity: p.quantity,
          price: p.price,
          subtotal: p.price * p.quantity
        }))
      },
      productsNotProcessed: productsNotProcessed.length > 0 ? productsNotProcessed : undefined
    });

  } catch (error) {
    console.error('Error in purchaseCart:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Error al procesar la compra' 
    });
  }
};