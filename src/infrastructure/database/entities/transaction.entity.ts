import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  status: string;

  @Column('uuid')
  productId: string;

  @Column()
  customerEmail: string;
}
