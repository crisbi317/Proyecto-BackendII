import { cartDBManager } from '../dao/cartDBManager.js';
import { productDBManager } from '../dao/productDBManager.js';
import productModel from '../dao/models/productModel.js';

class CartRepository {
  constructor() {
    this.productManager = new productDBManager();
    this.cartManager = new cartDBManager(this.productManager);
  }

  async getAll() {
    try {
      return await this.cartManager.getAllCarts();
    } catch (error) {
      throw error;
    }
  }

  async getById(id) {
    try {
      return await this.cartManager.getProductsFromCartByID(id);
    } catch (error) {
      if (error.message && error.message.includes("Schema hasn't been registered")) {
        throw new Error('Error al cargar los productos del carrito. Por favor, recarga la página.');
      }
      throw error;
    }
  }

  async create() {
    try {
      return await this.cartManager.createCart();
    } catch (error) {
      throw error;
    }
  }

  async addProduct(cartId, productId) {
    try {
      // Verificar stock del producto
      const product = await this.productManager.getProductByID(productId);
      
      const cart = await this.cartManager.getProductsFromCartByID(cartId);
      const existingProduct = cart.products.find(
        item => item.product._id.toString() === productId
      );
      
      const currentQuantity = existingProduct ? existingProduct.quantity : 0;
    
      if (product.stock <= 0) {
        throw new Error(`No hay stock disponible para este producto`);
      }
      
      // Reducir stock temporalmente al agregar al carrito
      await this.productManager.updateProduct(productId, { 
        stock: product.stock - 1 
      });
      
      return await this.cartManager.addProductByID(cartId, productId);
    } catch (error) {
      if (error.message && error.message.includes("Schema hasn't been registered")) {
        throw new Error('Error al cargar el producto. Por favor, recarga la página e intenta nuevamente.');
      }
      throw error;
    }
  }

  async deleteProduct(cartId, productId) {
    try {
      
      const cart = await this.cartManager.getProductsFromCartByID(cartId);
      const existingProduct = cart.products.find(
        item => item.product._id.toString() === productId
      );
      
      if (existingProduct) {
        const product = await this.productManager.getProductByID(productId);
        await this.productManager.updateProduct(productId, { 
          stock: product.stock + existingProduct.quantity 
        });
      }
      
      return await this.cartManager.deleteProductByID(cartId, productId);
    } catch (error) {
      throw error;
    }
  }

  async updateAllProducts(cartId, products) {
    try {
      return await this.cartManager.updateAllProducts(cartId, products);
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(cartId, productId, quantity) {
    try {
      
      const cart = await this.cartManager.getProductsFromCartByID(cartId);
      const existingProduct = cart.products.find(
        item => item.product._id.toString() === productId
      );
      
      if (!existingProduct) {
        throw new Error('Producto no encontrado en el carrito');
      }
      
      const currentQuantityInCart = existingProduct.quantity;
      const difference = quantity - currentQuantityInCart;
      
      const product = await this.productManager.getProductByID(productId);

      if (difference > 0 && product.stock < difference) {
        throw new Error(`No hay suficiente stock disponible. Stock actual: ${product.stock}, necesitas: ${difference} más`);
      }
      
    
      await this.productManager.updateProduct(productId, { 
        stock: product.stock - difference 
      });
      
      return await this.cartManager.updateProductByID(cartId, productId, quantity);
    } catch (error) {
      throw error;
    }
  }

  async deleteAllProducts(cartId, restoreStock = true) {
    try {
      // Solo devolver el stock si restoreStock es true
      if (restoreStock) {
        const cart = await this.cartManager.getProductsFromCartByID(cartId);
        
        for (const item of cart.products) {
          const product = await this.productManager.getProductByID(item.product._id);
          await this.productManager.updateProduct(item.product._id, { 
            stock: product.stock + item.quantity 
          });
        }
      }
      
      return await this.cartManager.deleteAllProducts(cartId);
    } catch (error) {
      throw error;
    }
  }

  async updateProducts(cartId, products) {
    return this.updateAllProducts(cartId, products);
  }

  
  async clearCart(cartId, restoreStock = true) {
    return this.deleteAllProducts(cartId, restoreStock);
  }
}

export default new CartRepository();