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
}

export default new CartRepository();