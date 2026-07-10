import { Injectable, Inject } from '@nestjs/common';
import { Product } from '../../domain/models/product.model';
import { ProductRepository, PRODUCT_REPOSITORY } from '../../domain/ports/product.repository';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }
}
