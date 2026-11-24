import { Request, Response } from 'express';
import ProductsService from '../services/ProductsService';
import { CreateProductDTO, UpdateProductDTO } from '../dtos/product.dto';
import { AuthRequest } from '@/middleware/auth.middleware';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendCreated, sendError } from '@/utils/api.utils';

class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  private fail(res: Response, error: unknown): void {
    if (error instanceof AppError) { sendError(res, error.message, error.statusCode); return; }
    logger.error('Product operation failed:', error);
    sendError(res, 'Internal server error', 500);
  }
  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      sendCreated(res, await this.productsService.createProduct(req.body as CreateProductDTO, req.user), 'Product created');
    } catch (error) { this.fail(res, error); }
  };
  getById = async (req: Request, res: Response): Promise<void> => {
    try { sendSuccess(res, await this.productsService.getProductById(req.params.id)); }
    catch (error) { this.fail(res, error); }
  };
  getAll = async (_req: Request, res: Response): Promise<void> => {
    try { sendSuccess(res, await this.productsService.getAllProducts()); }
    catch (error) { this.fail(res, error); }
  };
  update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      sendSuccess(res, await this.productsService.updateProduct(req.params.id, req.body as UpdateProductDTO, req.user), 'Product updated');
    } catch (error) { this.fail(res, error); }
  };
  delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      await this.productsService.deleteProduct(req.params.id, req.user);
      sendSuccess(res, null, 'Product deleted');
    } catch (error) { this.fail(res, error); }
  };
}
export default ProductsController;
