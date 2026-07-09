import productRepository from '../repositories/productRepository';
import { Product, Prisma } from '@prisma/client';

class ProductService {
  async getAllProducts(): Promise<Product[]> {
    return productRepository.findAll();
  }

  async getProductById(id: string): Promise<Product | null> {
    return productRepository.findById(id);
  }

  async getProductBySku(sku: string): Promise<Product | null> {
    return productRepository.findBySku(sku);
  }

  async createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
    return productRepository.create(data);
  }

  async updateProduct(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return productRepository.update(id, data);
  }

  async deleteProduct(id: string): Promise<Product> {
    return productRepository.delete(id);
  }
}

export default new ProductService();
