import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;
}
