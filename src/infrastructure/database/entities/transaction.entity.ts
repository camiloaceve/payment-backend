import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  status: string;

  @Column({ type: 'varchar', length: 36 })
  productId: string;

  @Column()
  customerEmail: string;
}
