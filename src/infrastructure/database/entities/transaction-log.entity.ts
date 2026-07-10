import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('transaction_logs')
export class TransactionLogEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 36 })
  transactionId: string;

  @Column()
  status: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
