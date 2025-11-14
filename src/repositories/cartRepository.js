import { cartDBManager } from '../dao/cartDBManager.js';
import { productDBManager } from '../dao/productDBManager.js';

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
      // Verificar stock del producto antes de agregar
      const product = await this.productManager.getProductByID(productId);
      
      // Obtener el carrito para verificar cantidad actual
      const cart = await this.cartManager.getProductsFromCartByID(cartId);
      const existingProduct = cart.products.find(
        item => item.product._id.toString() === productId
      );
      
      const currentQuantity = existingProduct ? existingProduct.quantity : 0;
      
      // Verificar si hay stock disponible
      if (product.stock <= currentQuantity) {
        throw new Error(`No hay suficiente stock disponible. Stock actual: ${product.stock}, cantidad en carrito: ${currentQuantity}`);
      }
      
      return await this.cartManager.addProductByID(cartId, productId);
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(cartId, productId) {
    try {
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
      // Verificar stock del producto antes de actualizar
      const product = await this.productManager.getProductByID(productId);
      
      // Verificar si la cantidad solicitada no excede el stock
      if (quantity > product.stock) {
        throw new Error(`No hay suficiente stock disponible. Stock actual: ${product.stock}, cantidad solicitada: ${quantity}`);
      }
      
      return await this.cartManager.updateProductByID(cartId, productId, quantity);
    } catch (error) {
      throw error;
    }
  }

  async deleteAllProducts(cartId) {
    try {
      return await this.cartManager.deleteAllProducts(cartId);
    } catch (error) {
      throw error;
    }
  }

  // Alias para compatibilidad
  async updateProducts(cartId, products) {
    return this.updateAllProducts(cartId, products);
  }

  // Alias para compatibilidad
  async clearCart(cartId) {
    return this.deleteAllProducts(cartId);
  }
}

export default new CartRepository();