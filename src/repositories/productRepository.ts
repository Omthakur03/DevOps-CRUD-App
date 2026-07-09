import prisma from '../config/db';
import { Product, Prisma } from '@prisma/client';

class ProductRepository {
  async findAll(): Promise<Product[]> {
    return prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id }
    });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { sku }
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({
      data
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Product> {
    return prisma.product.delete({
      where: { id }
    });
  }
}

export default new ProductRepository();
