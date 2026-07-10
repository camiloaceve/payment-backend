import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepository } from '../../../domain/ports/product.repository';
import { Product } from '../../../domain/models/product.model';
import { ProductEntity } from '../../database/entities/product.entity';

@Injectable()
export class MysqlProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;

    return new Product(entity.id, entity.name, Number(entity.price), entity.stock);
  }

  async save(product: Product): Promise<void> {
    const entity = new ProductEntity();
    entity.id = product.id;
    entity.name = product.name;
    entity.price = product.price;
    entity.stock = product.stock;

    await this.repository.save(entity);
  }

  async findAll(): Promise<Product[]> {
    const entities = await this.repository.find();
    return entities.map(entity => new Product(entity.id, entity.name, Number(entity.price), entity.stock));
  }
}
