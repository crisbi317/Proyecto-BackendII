import { productDBManager } from '../dao/productDBManager.js';
import ProductDTO from '../dto/productDTO.js';

class ProductRepository {
  constructor() {
    this.productManager = new productDBManager();
  }

  async getAll(params) {
    try {
      const products = await this.productManager.getAllProducts(params);
      
      // Convertir los docs a DTOs
      if (products.docs) {
        products.docs = products.docs.map(product => new ProductDTO(product));
      }
      
      return products;
    } catch (error) {
      throw error;
    }
  }

  async getById(id) {
    try {
      const product = await this.productManager.getProductByID(id);
      return product ? new ProductDTO(product) : null;
    } catch (error) {
      throw error;
    }
  }

  async create(productData) {
    try {
      const product = await this.productManager.createProduct(productData);
      return new ProductDTO(product);
    } catch (error) {
      throw error;
    }
  }

  async update(id, productData) {
    try {
      const result = await this.productManager.updateProduct(id, productData);
      if (result.modifiedCount === 0) {
        throw new Error(`El producto ${id} no existe o no se modificó`);
      }
      // Obtener el producto actualizado
      const updatedProduct = await this.productManager.getProductByID(id);
      return new ProductDTO(updatedProduct);
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.productManager.deleteProduct(id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateStock(productId, quantityToSubtract) {
    try {
      const product = await this.productManager.getProductByID(productId);
      
      if (!product) {
        throw new Error(`Producto ${productId} no encontrado`);
      }

      const newStock = product.stock - quantityToSubtract;
      
      if (newStock < 0) {
        throw new Error(`Stock insuficiente para el producto ${product.title}`);
      }

      await this.productManager.updateProduct(productId, { stock: newStock });
      
      return { 
        productId, 
        previousStock: product.stock, 
        newStock,
        quantitySubtracted: quantityToSubtract
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new ProductRepository();