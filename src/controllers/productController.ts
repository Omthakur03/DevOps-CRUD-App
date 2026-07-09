import { Request, Response, NextFunction } from 'express';
import productService from '../services/productService';

class ProductController {
  getAllProducts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await productService.getAllProducts();
      res.json({ status: 'success', data: products });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      if (!product) {
        const error = new Error('Product not found') as any;
        error.statusCode = 404;
        throw error;
      }
      res.json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description, price, sku, stock } = req.body;

      if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Product name is required and must be a non-empty string') as any;
        error.statusCode = 400;
        throw error;
      }

      if (price === undefined || typeof price !== 'number' || price < 0) {
        const error = new Error('Product price is required and must be a non-negative number') as any;
        error.statusCode = 400;
        throw error;
      }

      if (!sku || typeof sku !== 'string' || sku.trim() === '') {
        const error = new Error('Product SKU is required and must be a non-empty string') as any;
        error.statusCode = 400;
        throw error;
      }

      const existingProduct = await productService.getProductBySku(sku);
      if (existingProduct) {
        const error = new Error(`Product with SKU "${sku}" already exists`) as any;
        error.statusCode = 409;
        throw error;
      }

      const product = await productService.createProduct({
        name,
        description,
        price,
        sku,
        stock: stock !== undefined ? Number(stock) : 0
      });

      res.status(201).json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, price, sku, stock } = req.body;

      const existingProduct = await productService.getProductById(id);
      if (!existingProduct) {
        const error = new Error('Product not found') as any;
        error.statusCode = 404;
        throw error;
      }

      if (sku && sku !== existingProduct.sku) {
        const productWithSku = await productService.getProductBySku(sku);
        if (productWithSku) {
          const error = new Error(`Product with SKU "${sku}" already exists`) as any;
          error.statusCode = 409;
          throw error;
        }
      }

      const updated = await productService.updateProduct(id, {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        price: price !== undefined ? price : undefined,
        sku: sku !== undefined ? sku : undefined,
        stock: stock !== undefined ? Number(stock) : undefined
      });

      res.json({ status: 'success', data: updated });
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const existingProduct = await productService.getProductById(id);
      if (!existingProduct) {
        const error = new Error('Product not found') as any;
        error.statusCode = 404;
        throw error;
      }
      await productService.deleteProduct(id);
      res.json({ status: 'success', message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default new ProductController();
