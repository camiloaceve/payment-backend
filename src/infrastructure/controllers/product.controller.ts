import { Controller, Get } from '@nestjs/common';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';

@Controller('products')
export class ProductController {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

  @Get()
  async getProducts() {
    const products = await this.getProductsUseCase.execute();
    return products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
    }));
  }
}
